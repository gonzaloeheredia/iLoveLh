export type ToolId =
  | 'unir-pdf'
  | 'separar-pdf'
  | 'pdf-a-word'
  | 'word-a-pdf'
  | 'resumir-pdf'
  | 'traducir-pdf'

export interface Feature {
  title: string
  description: string
}

export interface ToolConfig {
  id: ToolId
  path: string
  titleWhite: string
  titleAccent: string
  description: string
  dropTitle: string
  dropSubtitle: string
  buttonText: string
  accept: Record<string, string[]>
  multiple: boolean
  features: Feature[]
}

export const tools: ToolConfig[] = [
  {
    id: 'unir-pdf',
    path: '/unir-pdf',
    titleWhite: 'Unir',
    titleAccent: 'PDF',
    description:
      'Combiná varios documentos PDF en uno solo, en el orden que quieras. Procesado de forma privada en tu servidor.',
    dropTitle: 'Arrastrá tus PDFs aquí',
    dropSubtitle: 'o hacé clic para seleccionarlos desde tu computadora',
    buttonText: 'Seleccionar PDFs',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    features: [
      {
        title: '100% privado',
        description: 'Los archivos se procesan en tu servidor. Resultados guardados de forma segura.',
      },
      {
        title: 'Sin límites',
        description: 'Uní todos los PDFs que necesites, del tamaño que sea.',
      },
      {
        title: 'Orden a medida',
        description: 'Reordená los documentos arrastrándolos antes de unirlos.',
      },
    ],
  },
  {
    id: 'separar-pdf',
    path: '/separar-pdf',
    titleWhite: 'Separar',
    titleAccent: 'PDF',
    description:
      'Dividí un PDF en varios archivos o extraé páginas específicas. Todo se procesa en tu servidor.',
    dropTitle: 'Arrastrá tu PDF aquí',
    dropSubtitle: 'o hacé clic para seleccionarlo desde tu computadora',
    buttonText: 'Seleccionar PDF',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    features: [
      {
        title: '100% privado',
        description: 'Los archivos se procesan en tu servidor. Resultados guardados de forma segura.',
      },
      {
        title: 'Por páginas',
        description: 'Separá por rangos (ej. 1-3, 5) o extraé cada página individualmente.',
      },
      {
        title: 'Descarga al instante',
        description: 'Obtené tus archivos separados listos para descargar en segundos.',
      },
    ],
  },
  {
    id: 'pdf-a-word',
    path: '/pdf-a-word',
    titleWhite: 'PDF a',
    titleAccent: 'Word',
    description:
      'Convertí tus documentos PDF a formato Word (.docx) editable. Ideal para revisar y modificar contratos y escritos.',
    dropTitle: 'Arrastrá tu PDF aquí',
    dropSubtitle: 'o hacé clic para seleccionarlo desde tu computadora',
    buttonText: 'Seleccionar PDF',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    features: [
      {
        title: '100% privado',
        description: 'La conversión se realiza en tu servidor de forma privada.',
      },
      {
        title: 'Formato editable',
        description: 'Obtené un archivo .docx listo para editar en Word o Google Docs.',
      },
      {
        title: 'Rápido y simple',
        description: 'Subí tu PDF, convertí y descargá en un solo paso.',
      },
    ],
  },
  {
    id: 'word-a-pdf',
    path: '/word-a-pdf',
    titleWhite: 'Word a',
    titleAccent: 'PDF',
    description:
      'Convertí documentos Word (.doc, .docx) a PDF de alta calidad. Perfecto para compartir y archivar documentos legales.',
    dropTitle: 'Arrastrá tu documento Word aquí',
    dropSubtitle: 'o hacé clic para seleccionarlo desde tu computadora',
    buttonText: 'Seleccionar Word',
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    multiple: false,
    features: [
      {
        title: '100% privado',
        description: 'Tu documento se procesa en tu servidor y el resultado queda guardado.',
      },
      {
        title: 'Alta fidelidad',
        description: 'Conservá el formato, tipografías y diseño de tu documento original.',
      },
      {
        title: 'Listo para compartir',
        description: 'Generá un PDF universal compatible con cualquier dispositivo.',
      },
    ],
  },
  {
    id: 'resumir-pdf',
    path: '/resumir-pdf',
    titleWhite: 'Resumir',
    titleAccent: 'PDF',
    description:
      'Generá un resumen claro del contenido de un PDF con IA. Ideal para contratos, escritos y documentos extensos.',
    dropTitle: 'Arrastrá tu PDF aquí',
    dropSubtitle: 'El documento debe contener texto seleccionable (no escaneado)',
    buttonText: 'Seleccionar PDF',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    features: [
      {
        title: 'Resumen con IA',
        description: 'Gemini analiza el texto y produce un resumen en el idioma del documento.',
      },
      {
        title: 'PDF descargable',
        description: 'Obtené un PDF con el resumen listo para compartir o archivar.',
      },
      {
        title: 'Límite de 10 MB',
        description: 'Pensado para documentos legales habituales y control de costo por tokens.',
      },
    ],
  },
  {
    id: 'traducir-pdf',
    path: '/traducir-pdf',
    titleWhite: 'Traducir',
    titleAccent: 'PDF',
    description:
      'Traducí un PDF completo a otro idioma con IA. El resultado es un PDF nuevo con el texto traducido, listo para leer o compartir.',
    dropTitle: 'Arrastrá tu PDF aquí',
    dropSubtitle: 'El documento debe contener texto seleccionable (no escaneado)',
    buttonText: 'Seleccionar PDF',
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    features: [
      {
        title: 'Traducción con IA',
        description: 'Gemini traduce el contenido preservando párrafos y estructura general.',
      },
      {
        title: 'Varios idiomas',
        description: 'Elegí entre español, inglés, portugués, francés, alemán e italiano.',
      },
      {
        title: 'Límite de 10 MB',
        description: 'Documentos largos se procesan por lotes; puede tardar un poco más.',
      },
    ],
  },
]

export function getToolById(id: ToolId): ToolConfig | undefined {
  return tools.find((t) => t.id === id)
}
