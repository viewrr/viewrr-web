import { describe, it, expect } from 'vitest'
import { deriveHandle } from './deriveHandle'

describe('deriveHandle', () => {
  it('golden vector: all-zero key -> abandon-abandon-0000', () => {
    // FROZEN contract golden vector shared with mobile + server.
    expect(deriveHandle('00'.repeat(32))).toBe('abandon-abandon-0000')
  })

  it('is deterministic for the same key', () => {
    const pk = 'a1b2c3d4' + '00'.repeat(26) + '9f2a'
    expect(deriveHandle(pk)).toBe(deriveHandle(pk))
  })

  it('produces distinct handles for different keys', () => {
    const a = deriveHandle('00'.repeat(32))
    const b = deriveHandle('ff'.repeat(32))
    expect(a).not.toBe(b)
  })

  it('suffix comes from the last two bytes', () => {
    // First 4 bytes zero -> abandon-abandon; last two bytes 0x9f 0x2a -> 9f2a.
    const pk = '00'.repeat(30) + '9f2a'
    expect(deriveHandle(pk)).toBe('abandon-abandon-9f2a')
  })

  it('rejects keys that are not 32 bytes', () => {
    expect(() => deriveHandle('00'.repeat(16))).toThrow()
  })
})
