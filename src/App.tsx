import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import DataEditor from "./pages/DataEditor"
import ScraperConfig from "./pages/ScraperConfig"
import Options from "./pages/Options"
import PdfResult from "./pages/PdfResult"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<DataEditor />} />
        <Route path="/scraper" element={<ScraperConfig />} />
        <Route path="/opciones" element={<Options />} />
        <Route path="/pdf" element={<PdfResult />} />
      </Routes>
    </BrowserRouter>
  )
}
