import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HerramientasPage } from './pages/HerramientasPage'
import { UnirPdfPage } from './pages/UnirPdfPage'
import { SepararPdfPage } from './pages/SepararPdfPage'
import { ConversionPage } from './pages/ConversionPage'
import { HistorialPage } from './pages/HistorialPage'
import { ReportarProblemaPage } from './pages/ReportarProblemaPage'
import { ResumirPdfPage } from './pages/ResumirPdfPage'
import { TraducirPdfPage } from './pages/TraducirPdfPage'
import { EstadisticasPage } from './pages/EstadisticasPage'
import { LoginPage } from './pages/LoginPage'
import { getToolById } from './types/tools'

function AppLayout() {
  const unirConfig = getToolById('unir-pdf')!
  const separarConfig = getToolById('separar-pdf')!
  const pdfAWordConfig = getToolById('pdf-a-word')!
  const wordAPdfConfig = getToolById('word-a-pdf')!
  const resumirConfig = getToolById('resumir-pdf')!
  const traducirConfig = getToolById('traducir-pdf')!

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/herramienta" element={<HerramientasPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/estadisticas" element={<EstadisticasPage />} />
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
        <Route path="/resumir-pdf" element={<ResumirPdfPage config={resumirConfig} />} />
        <Route path="/traducir-pdf" element={<TraducirPdfPage config={traducirConfig} />} />
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
        <Route path="*" element={<Navigate to="/herramienta" replace />} />
      </Routes>
    </>
  )
}

function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/'

  return (
    <div className="flex min-h-svh flex-col">
      {isLoginPage && <Navbar variant="minimal" />}
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

export default App
