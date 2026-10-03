// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { app, BrowserWindow, session } from 'electron';
import type { Event } from 'electron';

import { createLogger } from '../ts/logging/log.std.ts';
import * as Errors from '../ts/types/errors.std.ts';
import { parseSignalRoute } from '../ts/util/signalRoutes.std.ts';
import { maybeParseUrl } from '../ts/util/url.std.ts';
import { requestedShutdown } from './window_state.std.ts';

const log = createLogger('captcha_window');
let captchaWindow: BrowserWindow | undefined;

export function closeCaptchaWindow(): void {
  const window = captchaWindow;
  captchaWindow = undefined;
  if (window && !window.isDestroyed()) {
    window.destroy();
  }
}

export async function openCaptchaWindow({
  parent,
  url,
  onCaptcha,
}: Readonly<{
  parent: BrowserWindow;
  url: string;
  onCaptcha: (captcha: string) => void;
}>): Promise<void> {
  if (requestedShutdown() || parent.isDestroyed()) {
    return;
  }
  const target = maybeParseUrl(url);
  if (target?.protocol !== 'https:') {
    return;
  }
  if (captchaWindow) {
    captchaWindow.focus();
    return;
  }

  // The main session blocks HTTPS. Keep remote CAPTCHA content isolated from it.
  const captchaSession = session.fromPartition('fumi-captcha', {
    cache: false,
  });
  captchaSession.setPermissionRequestHandler(
    (_contents, _permission, callback) => callback(false)
  );
  captchaSession.setPermissionCheckHandler(() => false);

  const window = new BrowserWindow({
    title: `${app.getName()} — CAPTCHA`,
    width: 520,
    height: 720,
    parent,
    show: false,
    webPreferences: {
      session: captchaSession,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  captchaWindow = window;
  window.once('closed', () => {
    if (captchaWindow === window) {
      captchaWindow = undefined;
    }
  });
  window.once('ready-to-show', () => {
    if (
      captchaWindow === window &&
      !requestedShutdown() &&
      !parent.isDestroyed()
    ) {
      window.show();
    }
  });

  const completeCaptcha = (value: string): void => {
    const route = parseSignalRoute(value);
    if (
      route?.key !== 'captcha' ||
      captchaWindow !== window ||
      requestedShutdown() ||
      parent.isDestroyed()
    ) {
      return;
    }
    closeCaptchaWindow();
    onCaptcha(route.args.captchaId);
  };
  const handleNavigation = (
    event: Event,
    value: string,
    isMainFrame: boolean
  ): void => {
    const destination = maybeParseUrl(value);
    if (destination?.protocol === 'signalcaptcha:') {
      event.preventDefault();
      completeCaptcha(value);
      return;
    }
    if (
      destination?.protocol !== 'https:' ||
      (isMainFrame && destination.origin !== target.origin)
    ) {
      event.preventDefault();
    }
  };
  window.webContents.on('will-frame-navigate', event => {
    handleNavigation(event, event.url, event.isMainFrame);
  });
  window.webContents.on('will-redirect', event => {
    handleNavigation(event, event.url, event.isMainFrame);
  });
  window.webContents.setWindowOpenHandler(({ url: value }) => {
    completeCaptcha(value);
    return { action: 'deny' };
  });
  window.webContents.on('will-prevent-unload', event => event.preventDefault());

  try {
    await window.loadURL(url);
  } catch (error) {
    if (captchaWindow === window) {
      closeCaptchaWindow();
      log.error('Failed to load CAPTCHA page', Errors.toLogFormat(error));
    }
  }
}
