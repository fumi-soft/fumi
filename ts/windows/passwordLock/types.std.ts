// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

export type PasswordLockSubmitResult =
  | Readonly<{ ok: true }>
  | Readonly<{
      ok: false;
      error: 'incorrect-password' | 'invalid-input' | 'failed';
    }>;

export type PasswordLockWindowData = Readonly<{
  locale: string;
  messages: Readonly<{
    windowTitle: string;
    setupTitle: string;
    setupDescription: string;
    unlockTitle: string;
    unlockDescription: string;
    passwordLabel: string;
    confirmationLabel: string;
    setupButton: string;
    unlockButton: string;
    processingButton: string;
    emptyPasswordError: string;
    passwordMismatchError: string;
    incorrectPasswordError: string;
    processingError: string;
  }>;
}>;
