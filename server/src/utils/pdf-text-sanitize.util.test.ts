import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizePdfText } from './pdf-text-sanitize.util.js'

describe('sanitizePdfText', () => {
  it('replaces bullets and middle dots with hyphens', () => {
    assert.equal(sanitizePdfText('• item · otro'), '- item - otro')
  })

  it('replaces curly quotes and dashes', () => {
    assert.equal(sanitizePdfText('"hola" — adiós'), '"hola" -- adiós')
  })
})
