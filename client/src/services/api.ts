const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function apiUrl(path: string): string {
  return `${API_URL}${path}`
}

export async function mergePdfs(files: File[]): Promise<Blob> {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  const response = await fetch(apiUrl('/api/merge'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? 'Hubo un error al unir los PDFs.')
  }

  return response.blob()
}
