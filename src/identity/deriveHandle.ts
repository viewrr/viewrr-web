import { wordlist } from '@scure/bip39/wordlists/english.js'

/**
 * FROZEN CROSS-REPO CONTRACT — do not change without updating mobile + server in lockstep.
 *
 * Derives a deterministic, display-only "handle" from an Ed25519 public key so humans
 * have a readable petname to disambiguate identities. The public key remains the real
 * identity; the handle carries no authority and requires no coordination.
 *
 * Algorithm (must match mobile + server byte-for-byte):
 *   pk     = hex-decode(publicKeyHex)               // 32-byte Ed25519 key, lowercase hex
 *   w1     = BIP39_ENGLISH[((pk[0] << 8) | pk[1]) % 2048]
 *   w2     = BIP39_ENGLISH[((pk[2] << 8) | pk[3]) % 2048]
 *   suffix = hex(pk[30]) + hex(pk[31])              // last 2 bytes -> 4 lowercase hex chars
 *   handle = `${w1}-${w2}-${suffix}`                // e.g. "swift-otter-9f2a"
 *
 * The BIP39 English wordlist is sourced from @scure/bip39 (canonical, audited) — the
 * same 2048-word list mobile and server use, which is what keeps this contract frozen.
 *
 * Golden vector: all-zero 32-byte key ("00".repeat(32)) -> "abandon-abandon-0000".
 */
export function deriveHandle(publicKeyHex: string): string {
  const pk = hexToBytes(publicKeyHex)
  if (pk.length !== 32) {
    throw new Error(
      `deriveHandle: expected a 32-byte Ed25519 public key, got ${pk.length} bytes`,
    )
  }

  const w1 = wordlist[((pk[0] << 8) | pk[1]) % 2048]
  const w2 = wordlist[((pk[2] << 8) | pk[3]) % 2048]
  const suffix = byteToHex(pk[30]) + byteToHex(pk[31])

  return `${w1}-${w2}-${suffix}`
}

function byteToHex(b: number): string {
  return b.toString(16).padStart(2, '0')
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0 || /[^0-9a-f]/.test(hex)) {
    throw new Error('deriveHandle: publicKeyHex must be lowercase hex with an even length')
  }
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}
