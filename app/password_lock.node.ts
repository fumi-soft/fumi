// Copyright 2026 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt,
} from 'node:crypto';
import { z } from 'zod';

const VERSION = 1;
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SCRYPT_OPTIONS = {
  N: 2 ** 17,
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024,
} as const;
const AAD = Buffer.from('Signal Password Lock v1', 'utf8');

const PasswordLockRecordSchema = z
  .object({
    version: z.literal(VERSION),
    salt: z.string().min(1),
    iv: z.string().min(1),
    ciphertext: z.string().min(1),
    tag: z.string().min(1),
  })
  .strict();

export type PasswordLockRecord = Readonly<
  z.infer<typeof PasswordLockRecordSchema>
>;

export class InvalidPasswordError extends Error {
  constructor() {
    super('Invalid password');
    this.name = 'InvalidPasswordError';
  }
}

function decodeBase64(
  value: string,
  field: string,
  expectedLength?: number
): Buffer<ArrayBuffer> {
  const result = Buffer.from(value, 'base64');
  if (
    result.toString('base64') !== value ||
    result.length === 0 ||
    (expectedLength !== undefined && result.length !== expectedLength)
  ) {
    throw new Error(`Invalid password lock ${field}`);
  }
  return result;
}

function validateRecord(record: PasswordLockRecord): void {
  decodeBase64(record.salt, 'salt', SALT_LENGTH);
  decodeBase64(record.iv, 'iv', IV_LENGTH);
  decodeBase64(record.ciphertext, 'ciphertext');
  decodeBase64(record.tag, 'tag', AUTH_TAG_LENGTH);
}

export function parsePasswordLock(
  value: unknown
): PasswordLockRecord | undefined {
  if (value === undefined) {
    return undefined;
  }

  const record = PasswordLockRecordSchema.parse(value);
  validateRecord(record);
  return record;
}

function deriveKey(
  password: string,
  salt: Buffer<ArrayBuffer>
): Promise<Buffer<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

export async function wrapEncryptedKey(
  password: string,
  encryptedKey: Buffer<ArrayBuffer>
): Promise<PasswordLockRecord> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(password, salt);

  try {
    const cipher = createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(AAD);
    const ciphertext = Buffer.concat([
      cipher.update(encryptedKey),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return {
      version: VERSION,
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      ciphertext: ciphertext.toString('base64'),
      tag: tag.toString('base64'),
    };
  } finally {
    key.fill(0);
  }
}

export async function unwrapEncryptedKey(
  password: string,
  record: PasswordLockRecord
): Promise<Buffer<ArrayBuffer>> {
  const salt = decodeBase64(record.salt, 'salt', SALT_LENGTH);
  const iv = decodeBase64(record.iv, 'iv', IV_LENGTH);
  const ciphertext = decodeBase64(record.ciphertext, 'ciphertext');
  const tag = decodeBase64(record.tag, 'tag', AUTH_TAG_LENGTH);
  const key = await deriveKey(password, salt);

  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(AAD);
    decipher.setAuthTag(tag);

    try {
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch {
      throw new InvalidPasswordError();
    }
  } finally {
    key.fill(0);
  }
}
