// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { drop } from '../../util/drop.std.ts';

import type {
  PasswordLockSubmitResult,
  PasswordLockWindowData,
} from './types.std.ts';

type PasswordLockWindow = Window &
  typeof globalThis & {
    PasswordLock: Readonly<{
      submit: (password: string) => Promise<PasswordLockSubmitResult>;
    }>;
  };

const passwordLock = (window as PasswordLockWindow).PasswordLock;
const searchParams = new URLSearchParams(window.location.search);
const mode = searchParams.get('mode') === 'setup' ? 'setup' : 'unlock';
const startupData = searchParams.get('data');
if (!startupData) {
  throw new Error('Password lock window is missing startup data');
}
const { locale, messages } = JSON.parse(startupData) as PasswordLockWindowData;
document.documentElement.lang = locale;
document.title = messages.windowTitle;

function getElement<T extends HTMLElement>(
  id: string,
  constructor: new () => T
): T {
  const element = document.getElementById(id);
  if (!(element instanceof constructor)) {
    throw new Error(`Password lock window is missing #${id}`);
  }
  return element;
}

const title = getElement('title', HTMLElement);
const description = getElement('description', HTMLElement);
const form = getElement('form', HTMLFormElement);
const passwordLabel = getElement('password-label', HTMLLabelElement);
const passwordInput = getElement('password', HTMLInputElement);
const confirmationGroup = getElement('confirmation-group', HTMLElement);
const confirmationLabel = getElement('confirmation-label', HTMLLabelElement);
const confirmationInput = getElement('confirmation', HTMLInputElement);
const errorMessage = getElement('error', HTMLElement);
const submitButton = getElement('submit', HTMLButtonElement);

passwordLabel.textContent = messages.passwordLabel;
confirmationLabel.textContent = messages.confirmationLabel;

if (mode === 'setup') {
  title.textContent = messages.setupTitle;
  description.textContent = messages.setupDescription;
  description.classList.add('password-lock__description--setup');
  passwordInput.autocomplete = 'new-password';
  confirmationGroup.hidden = false;
  confirmationInput.required = true;
  submitButton.textContent = messages.setupButton;
} else {
  title.textContent = messages.unlockTitle;
  description.textContent = messages.unlockDescription;
  submitButton.textContent = messages.unlockButton;
}

function showError(message: string): void {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function setDisabled(disabled: boolean): void {
  passwordInput.disabled = disabled;
  confirmationInput.disabled = disabled;
  submitButton.disabled = disabled;
  if (disabled) {
    submitButton.textContent = messages.processingButton;
  } else if (mode === 'setup') {
    submitButton.textContent = messages.setupButton;
  } else {
    submitButton.textContent = messages.unlockButton;
  }
}

async function submitPassword(): Promise<void> {
  errorMessage.hidden = true;
  const password = passwordInput.value;

  if (password.length === 0) {
    showError(messages.emptyPasswordError);
    passwordInput.focus();
    return;
  }

  if (mode === 'setup' && password !== confirmationInput.value) {
    showError(messages.passwordMismatchError);
    confirmationInput.select();
    return;
  }

  setDisabled(true);
  try {
    const result = await passwordLock.submit(password);
    if (result.ok) {
      return;
    }

    if (result.error === 'incorrect-password') {
      showError(messages.incorrectPasswordError);
      passwordInput.select();
    } else if (result.error === 'invalid-input') {
      showError(messages.emptyPasswordError);
      passwordInput.focus();
    } else {
      showError(messages.processingError);
    }
  } catch {
    showError(messages.processingError);
  } finally {
    setDisabled(false);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  drop(submitPassword());
});

passwordInput.focus({ preventScroll: true });
