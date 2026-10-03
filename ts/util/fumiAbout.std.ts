// Copyright 2026 Fumi contributors
// SPDX-License-Identifier: AGPL-3.0-only

export const FUMI_DISPLAY_VERSION = '0.9.0';

export const FUMI_PROJECT_URL = 'https://github.com/fumi-soft/fumi';
export const FUMI_RELEASES_URL = `${FUMI_PROJECT_URL}/releases`;
export const FUMI_LICENSES_URL = `${FUMI_PROJECT_URL}/blob/main/LICENSE`;
export const FUMI_ACKNOWLEDGMENTS_URL = `${FUMI_PROJECT_URL}/blob/main/ACKNOWLEDGMENTS.md`;

export function getFumiAboutVersion(signalVersion: string): string {
  return `${FUMI_DISPLAY_VERSION} (Signal Desktop ${signalVersion})`;
}
