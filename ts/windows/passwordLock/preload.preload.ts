// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { contextBridge, ipcRenderer } from 'electron';

import type { PasswordLockSubmitResult } from './types.std.ts';

const PasswordLock = {
  submit(password: string): Promise<PasswordLockSubmitResult> {
    return ipcRenderer.invoke(
      'password-lock:submit',
      password
    ) as Promise<PasswordLockSubmitResult>;
  },
};

contextBridge.exposeInMainWorld('PasswordLock', PasswordLock);
