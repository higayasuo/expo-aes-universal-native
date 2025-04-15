import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NativeGcmCipher } from '../NativeGcmCipher';
import { NodeGcmCipher } from './NodeGcmCipher';
import { CryptoModule } from 'expo-crypto-universal';

describe('GcmCipher.decryptInternal', () => {
  let mockCryptoModule: CryptoModule;
  let nativeCipher: NativeGcmCipher;
  let nodeCipher: NodeGcmCipher;

  beforeEach(() => {
    mockCryptoModule = {
      getRandomBytes: vi
        .fn()
        .mockImplementation((size) => new Uint8Array(size).fill(0x42)),
    } as unknown as CryptoModule;
    nativeCipher = new NativeGcmCipher(mockCryptoModule);
    nodeCipher = new NodeGcmCipher(mockCryptoModule);
  });

  it('should produce the same result across all implementations', async () => {
    const encRawKey = new Uint8Array(16).fill(0xaa);
    const plaintext = new Uint8Array([1, 2, 3]);
    const aad = new Uint8Array([4, 5, 6]);
    const { ciphertext, tag, iv } = await nodeCipher.encrypt({
      enc: 'A128GCM',
      cek: encRawKey,
      plaintext,
      aad,
    });

    const nativeResult = await nativeCipher.decryptInternal({
      encRawKey,
      iv,
      ciphertext,
      tag,
      aad,
    });
    const nodeResult = await nodeCipher.decryptInternal({
      encRawKey,
      iv,
      ciphertext,
      tag,
      aad,
    });

    expect(nativeResult).toEqual(nodeResult);
    expect(nativeResult).toEqual(plaintext);
  });

  it('should handle empty ciphertext consistently', async () => {
    const encRawKey = new Uint8Array(16).fill(0xaa);
    const plaintext = new Uint8Array(0);
    const aad = new Uint8Array([4, 5, 6]);
    const { ciphertext, tag, iv } = await nodeCipher.encrypt({
      enc: 'A128GCM',
      cek: encRawKey,
      plaintext,
      aad,
    });

    const nativeResult = await nativeCipher.decryptInternal({
      encRawKey,
      iv,
      ciphertext,
      tag,
      aad,
    });
    const nodeResult = await nodeCipher.decryptInternal({
      encRawKey,
      iv,
      ciphertext,
      tag,
      aad,
    });

    expect(nativeResult).toEqual(nodeResult);
    expect(nativeResult).toEqual(plaintext);
  });

  it('should handle empty AAD consistently', async () => {
    const encRawKey = new Uint8Array(16).fill(0xaa);
    const plaintext = new Uint8Array([1, 2, 3]);
    const aad = new Uint8Array(0);
    const { ciphertext, tag, iv } = await nodeCipher.encrypt({
      enc: 'A128GCM',
      cek: encRawKey,
      plaintext,
      aad,
    });

    const nativeResult = await nativeCipher.decryptInternal({
      encRawKey,
      iv,
      ciphertext,
      tag,
      aad,
    });
    const nodeResult = await nodeCipher.decryptInternal({
      encRawKey,
      iv,
      ciphertext,
      tag,
      aad,
    });

    expect(nativeResult).toEqual(nodeResult);
    expect(nativeResult).toEqual(plaintext);
  });

  it('should reject invalid tag', async () => {
    const encRawKey = new Uint8Array(16).fill(0xaa);
    const plaintext = new Uint8Array([1, 2, 3]);
    const aad = new Uint8Array([4, 5, 6]);
    const { ciphertext, iv } = await nodeCipher.encrypt({
      enc: 'A128GCM',
      cek: encRawKey,
      plaintext,
      aad,
    });
    const invalidTag = new Uint8Array(16).fill(0xff);

    await expect(
      nativeCipher.decryptInternal({
        encRawKey,
        iv,
        ciphertext,
        tag: invalidTag,
        aad,
      }),
    ).rejects.toThrow();
    await expect(
      nodeCipher.decryptInternal({
        encRawKey,
        iv,
        ciphertext,
        tag: invalidTag,
        aad,
      }),
    ).rejects.toThrow();
  });
});
