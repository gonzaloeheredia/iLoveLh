import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildDownloadFilename,
  detectSourceExtension,
  stripKnownExtensions,
} from './filename.util.js'

describe('detectSourceExtension', () => {
  it('prefers mime type over filename extension', () => {
    assert.equal(
      detectSourceExtension('archivo.docx.pdf', 'application/pdf'),
      'pdf',
    )
  })

  it('falls back to filename extension when mime is absent', () => {
    assert.equal(detectSourceExtension('report.pdf'), 'pdf')
    assert.equal(detectSourceExtension('report.docx'), 'docx')
  })
})

describe('stripKnownExtensions', () => {
  it('removes stacked extensions from the end', () => {
    assert.equal(stripKnownExtensions('archivo.docx.pdf'), 'archivo')
    assert.equal(stripKnownExtensions('CV_Gonzalo_Heredia_ES.docx.pdf'), 'CV_Gonzalo_Heredia_ES')
  })

  it('removes a single known extension', () => {
    assert.equal(stripKnownExtensions('report.pdf'), 'report')
    assert.equal(stripKnownExtensions('report.docx'), 'report')
  })

  it('leaves names without known extensions unchanged', () => {
    assert.equal(stripKnownExtensions('archivo.txt'), 'archivo.txt')
  })
})

describe('buildDownloadFilename', () => {
  it('turns archivo.docx.pdf into archivo.pdf when target is pdf', () => {
    assert.equal(buildDownloadFilename('archivo.docx.pdf', 'pdf'), 'archivo.pdf')
  })

  it('turns archivo.docx.pdf into archivo.docx when target is docx', () => {
    assert.equal(buildDownloadFilename('archivo.docx.pdf', 'docx'), 'archivo.docx')
  })

  it('does not produce double extensions', () => {
    assert.notEqual(buildDownloadFilename('archivo.docx.pdf', 'docx'), 'archivo.docx.docx')
    assert.notEqual(buildDownloadFilename('archivo.docx.pdf', 'pdf'), 'archivo.docx.pdf')
  })
})
