/**
 * Normalizes characters that may be missing from embedded fonts or cause
 * encoding issues when rendering AI-generated text in PDFs.
 */
export function sanitizePdfText(text: string): string {
  return text
    .replace(/\u2022|\u25cf|\u25aa|\u2023|\u2043/g, '-')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '--')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0|\u202F|\u2007/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00B7/g, '-')
    .replace(/\u2212/g, '-')
}
