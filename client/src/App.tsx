import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { HerramientasPage } from './pages/HerramientasPage'
import { UnirPdfPage } from './pages/UnirPdfPage'
import { SepararPdfPage } from './pages/SepararPdfPage'
import { ConversionPage } from './pages/ConversionPage'
import { HistorialPage } from './pages/HistorialPage'
import { ReportarProblemaPage } from './pages/ReportarProblemaPage'
import { getToolById } from './types/tools'

function App() {
  const unirConfig = getToolById('unir-pdf')!
  const separarConfig = getToolById('separar-pdf')!
  const pdfAWordConfig = getToolById('pdf-a-word')!
  const wordAPdfConfig = getToolById('word-a-pdf')!

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/herramienta" replace />} />
        <Route path="/herramienta" element={<HerramientasPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/reportar-problema" element={<ReportarProblemaPage />} />
        <Route path="/unir-pdf" element={<UnirPdfPage config={unirConfig} />} />
        <Route path="/separar-pdf" element={<SepararPdfPage config={separarConfig} />} />
        <Route
          path="/pdf-a-word"
          element={
            <ConversionPage
              config={pdfAWordConfig}
              kind="pdf-to-word"
              outputExtension="docx"
            />
          }
        />
        <Route
          path="/word-a-pdf"
          element={
            <ConversionPage
              config={wordAPdfConfig}
              kind="word-to-pdf"
              outputExtension="pdf"
            />
          }
        />
      </Routes>
    </>
  )
}

export default App
