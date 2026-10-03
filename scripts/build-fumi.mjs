// Copyright 2026 Fumi contributors
// SPDX-License-Identifier: AGPL-3.0-only
// @ts-check
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { Arch, build, Platform } from 'electron-builder';

if (process.platform !== 'darwin') {
  throw new Error('Fumi distribution builds require macOS.');
}

const projectDir = join(import.meta.dirname, '..');
process.env.SIGNAL_ENV = 'production';
process.env.SOURCE_DATE_EPOCH ||= String(Math.floor(Date.now() / 1000));

// Ad-hoc signing must not import or discover a certificate.
process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
delete process.env.CSC_LINK;
delete process.env.CSC_NAME;

execFileSync('pnpm', ['run', 'build:dev'], {
  cwd: projectDir,
  stdio: 'inherit',
});

await build({
  projectDir,
  targets: Platform.MAC.createTarget('dmg', Arch.arm64),
  publish: 'never',
  config: {
    directories: { output: 'release/fumi' },
    extraMetadata: { environment: 'production' },
    mac: {
      notarize: false,
      publish: null,
      // The inherited afterPack hook finishes before this signing hook runs.
      sign: async ({ app }) => {
        execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], {
          stdio: 'inherit',
        });
      },
    },
    // Replace upstream notarization with a final check before DMG creation.
    afterSign: async ({ appOutDir, packager }) => {
      const appPath = join(
        appOutDir,
        `${packager.appInfo.productFilename}.app`
      );
      execFileSync(
        'codesign',
        ['--verify', '--deep', '--strict', '--verbose=2', appPath],
        { stdio: 'inherit' }
      );
    },
    afterAllArtifactBuild: null,
  },
});
