export interface ReportInput {
  description: string
  screenshots: File[]
}

export interface ReportRecord {
  id: string
  description: string
  screenshotFiles: string[]
  createdAt: string
}

export async function submitReport(input: ReportInput): Promise<ReportRecord> {
  const screenshots = await Promise.all(
    input.screenshots.map(async (file) => ({
      name: file.name,
      data: await fileToBase64(file),
    })),
  )

  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: input.description,
      screenshots,
    }),
  })

  if (!response.ok) {
    throw new Error('No se pudo enviar el reporte.')
  }

  return response.json()
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
