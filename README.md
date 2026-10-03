<!-- Copyright 2014 Signal Messenger, LLC -->
<!-- SPDX-License-Identifier: AGPL-3.0-only -->

# Fumi

Fumi is an independent, unofficial, messaging-only fork of Signal Desktop for macOS Apple Silicon. It uses the Signal service and is not affiliated with Signal.

Fumi provides password-gated startup, a purple light/dark theme, and English/Japanese display languages. It uses its own application identity and profile, separate from official Signal.

## Download

Binary downloads are in preparation. No Fumi project or release URL is available yet.

## Usage notes

- Create a password on first launch; subsequent launches require it before opening the database. Password recovery is not implemented.
- Lock and closing the main window use the application's quit flow. Cancelling a close confirmation leaves the application running.
- Incoming and outgoing calls, microphone capture, and camera capture are disabled. Existing messages, attachments, call history, and media playback are retained.
- Choose System Language, English, or Japanese. System languages other than Japanese resolve to English without changing regional date/time formatting.
- Fumi stores its data in `~/Library/Application Support/Fumi`. Do not import an official Signal profile.

## Diagnostics

Application diagnostic logging and crash-report generation are disabled. Startup removes only Fumi's own `logs` directory; other profile data is not a cleanup target.

## Updates

Fumi does not use the official Signal updater. Update manually by replacing the application bundle while retaining the Fumi profile and password-lock data. Build-expiration checks remain in place.

## Build from source

Build on a Mac with Apple Silicon using the exact Node.js and pnpm versions declared in [package.json](package.json), and the Xcode Command Line Tools.

Run the following commands from the source directory:

```sh
pnpm install --frozen-lockfile
pnpm run build:fumi
```

The command generates production assets and builds `release/fumi/fumi-desktop-mac-arm64-<version>.dmg`, containing Fumi.app and an `/Applications` link. The unpacked application is retained at `release/fumi/mac-arm64/Fumi.app`.

After bundle processing, the application is ad-hoc signed and its signature is verified before DMG creation. A signing or verification failure stops the build. The Fumi distribution path does not notarize or publish a release.

A missing or empty `SOURCE_DATE_EPOCH` defaults to build-start Unix time in seconds; a supplied non-empty value is preserved. Build creation and expiration use this timestamp, so source archives do not require Git metadata.

## Project

The settings sidebar contains a static Fumi on GitHub page. Its button remains disabled while the project page is in preparation.

## Cryptography Notice

This distribution includes cryptographic software. The country in which you currently reside may have restrictions on the import, possession, use, and/or re-export to another country, of encryption software.
BEFORE using any encryption software, please check your country's laws, regulations and policies concerning the import, possession, or use, and re-export of encryption software, to see if this is permitted.
See <http://www.wassenaar.org/> for more information.

The U.S. Government Department of Commerce, Bureau of Industry and Security (BIS), has classified this software as Export Commodity Control Number (ECCN) 5D002.C.1, which includes information security software using or performing cryptographic functions with asymmetric algorithms.
The form and manner of this distribution makes it eligible for export under the License Exception ENC Technology Software Unrestricted (TSU) exception (see the BIS Export Administration Regulations, Section 740.13) for both object code and source code.

## License and acknowledgements

Copyright 2013-2024 Signal Messenger, LLC

Licensed under the GNU Affero General Public License, version 3 only (`AGPL-3.0-only`). See [LICENSE](LICENSE) and [ACKNOWLEDGMENTS.md](ACKNOWLEDGMENTS.md) for the license and third-party notices.

Fumi is based on [Signal Desktop](https://github.com/signalapp/Signal-Desktop). We are grateful to the Signal contributors whose work Fumi builds on.
