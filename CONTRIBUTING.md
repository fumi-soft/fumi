<!-- Copyright 2015 Signal Messenger, LLC -->
<!-- SPDX-License-Identifier: AGPL-3.0-only -->

# Contributing to Fumi

Fumi is an independent, unofficial Signal Desktop fork for macOS on Apple Silicon. Contributions can include implementation review, reproducible bug reports, focused fixes, and improvements to documentation or English/Japanese text.

The [README](README.md) explains Fumi’s purpose and behavior. Its [implementation guide](README.md#review-the-implementation) points to the core password-protection, startup, shutdown, and calling-service code.

## Ways to contribute

- Examine how a documented behavior is implemented and identify a concrete discrepancy.
- Investigate an issue and provide reliable reproduction steps.
- Explain a root cause, with links to the relevant code.
- Review a proposed change and report what you checked.
- Improve the accuracy or clarity of documentation and interface text.

An investigation with a clear explanation can be useful on its own; a pull request is not required.

## Build from source

Use an Apple Silicon Mac with:

- Git.
- The exact Node.js and pnpm versions declared in [package.json](package.json).
- Xcode Command Line Tools.

Clone the Fumi repository and build the application:

```sh
git clone https://github.com/fumi-soft/fumi.git
cd fumi
pnpm install --frozen-lockfile
pnpm run build:fumi
```

The Fumi build generates production assets and produces:

- `release/fumi/fumi-desktop-mac-arm64-<version>.dmg`
- `release/fumi/mac-arm64/Fumi.app`

The DMG contains `Fumi.app` and an `/Applications` link.

The build performs ad-hoc signing and final signature verification after bundle processing and before DMG creation. It does not perform Apple notarization or publish a release.

After changing application code, styles, or translations, rebuild to include those changes in the packaged application.

## Fumi-specific design requirements

Changes should preserve the behavior and compatibility that define Fumi:

- **Password-protected database access.** Password setup or unlock completes before database initialization. Preserve the existing `passwordLock` version 1 format, SQLCipher database key, and macOS Keychain-backed protection.
- **Independent application data.** Fumi uses its own application identity, Keychain context, and profile. New installations start with a fresh Fumi profile; updates preserve existing Fumi data.
- **Session-ending Lock behavior.** Lock and main-window close use the application’s shutdown flow, closing the database and ending the process.
- **Processing-level calling disablement.** Incoming and outgoing calling remain disabled at the service and processing boundaries, alongside their UI controls.
- **Fixed capture and diagnostics restrictions.** Microphone and camera capture, new voice-message recording, application diagnostic logging, and crash-report generation remain disabled.
- **Preserved messaging data and functionality.** Existing messages, attachments, media playback, and call-history records remain available.
- **Manual updates.** Fumi’s distribution path keeps the official Signal updater disabled and preserves profile and password-lock data across application updates.

These requirements also apply when changes touch shared upstream code used by several features.

## Checking changes

Run the existing checks relevant to the code you changed. Available scripts are defined in [package.json](package.json).

For a behavior change, include the reproduction or verification steps and the result. Where existing tests cover the affected area, run them and update them as needed.

For application or packaging changes, build with `pnpm run build:fumi` and check the resulting application. Distinguish between a successful build, automated test results, and behavior verified in the running app.

## English and Japanese text

Fumi’s interface is provided in English and Japanese. When adding or changing app-facing text, update both:

- [`_locales/en/messages.json`](_locales/en/messages.json)
- [`_locales/ja/messages.json`](_locales/ja/messages.json)

Use ICU messages for translated interface text and preserve existing message IDs where appropriate.

Translation changes require regenerated ICU types and compact locales. The full `pnpm run build:fumi` command includes those generation steps.

Retain the upstream locale resources and the distinction between interface-language selection and regional date, time, and currency formatting.

## Reporting an issue

A useful report includes:

- The Fumi version and, when known, the source commit.
- The macOS version.
- The steps needed to reproduce the behavior.
- What you expected and what actually happened.
- Relevant build or test error output, or screenshots for a visual issue.
- The relevant code location and your findings, if you investigated the cause.

Fumi’s runtime diagnostic logging and crash-report generation are disabled, so clear reproduction steps and observed behavior are especially useful.

## Proposing a change

Keep a patch focused on the behavior it is intended to change.

In the pull request description, explain:

1. What changed.
2. Why the change is needed.
3. Which existing behavior and data compatibility it affects.
4. How it was checked, including the commands or manual steps used and their results.

Separate unrelated cleanup from the functional change so that the purpose and effect of the patch remain easy to review.

## License and upstream attribution

Fumi is based on [Signal Desktop](https://github.com/signalapp/Signal-Desktop).

Preserve existing copyright and SPDX notices when modifying upstream-derived files. The project is licensed under `AGPL-3.0-only`; see [LICENSE](LICENSE) and [ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md).
