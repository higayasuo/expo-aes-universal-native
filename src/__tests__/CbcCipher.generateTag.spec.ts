import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NativeCbcCipher } from '../NativeCbcCipher';
import { NodeCbcCipher } from './NodeCbcCipher';
import { CryptoModule } from 'expo-crypto-universal';
import crypto from 'crypto';

describe('CbcCipher.generateTag', () => {
  let mockCryptoModule: CryptoModule;
  let nativeCipher: NativeCbcCipher;
  let nodeCipher: NodeCbcCipher;

  beforeEach(() => {
    mockCryptoModule = {
      getRandomBytes: vi
        .fn()
        .mockImplementation((size) => new Uint8Array(size).fill(0x42)),
      sha256Async: vi.fn().mockImplementation((data: Uint8Array) => {
        const hash = crypto.createHash('sha256');
        hash.update(data);
        return Promise.resolve(new Uint8Array(hash.digest()));
      }),
    } as unknown as CryptoModule;
    nativeCipher = new NativeCbcCipher(mockCryptoModule);
    nodeCipher = new NodeCbcCipher(mockCryptoModule);
  });

  it.each([{ keyBits: 128 }, { keyBits: 192 }, { keyBits: 256 }])(
    'should produce the same result across all implementations for keyBits %j',
    async ({ keyBits }) => {
      const macRawKey = new Uint8Array(keyBits / 8).fill(0xaa);
      const macData = new Uint8Array([1, 2, 3]);

      const nativeResult = await nativeCipher.generateTag({
        macRawKey,
        macData,
        keyBits,
      });
      const nodeResult = await nodeCipher.generateTag({
        macRawKey,
        macData,
        keyBits,
      });

      expect(nativeResult).toEqual(nodeResult);
    },
  );

  it.each([{ keyBits: 128 }, { keyBits: 192 }, { keyBits: 256 }])(
    'should handle key size %j consistently',
    async ({ keyBits }) => {
      const macRawKey = new Uint8Array(keyBits / 8).fill(0xaa);
      const macData = new Uint8Array([1, 2, 3]);

      const nativeResult = await nativeCipher.generateTag({
        macRawKey,
        macData,
        keyBits,
      });
      const nodeResult = await nodeCipher.generateTag({
        macRawKey,
        macData,
        keyBits,
      });

      expect(nativeResult).toEqual(nodeResult);
    },
  );

  it.each([{ keyBits: 128 }, { keyBits: 192 }, { keyBits: 256 }])(
    'should handle empty macData consistently for keyBits %j',
    async ({ keyBits }) => {
      const macRawKey = new Uint8Array(keyBits / 8).fill(0xaa);
      const macData = new Uint8Array(0);

      const nativeResult = await nativeCipher.generateTag({
        macRawKey,
        macData,
        keyBits,
      });
      const nodeResult = await nodeCipher.generateTag({
        macRawKey,
        macData,
        keyBits,
      });

      expect(nativeResult).toEqual(nodeResult);
    },
  );
});
