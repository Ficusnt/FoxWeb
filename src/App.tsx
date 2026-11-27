import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import DataEditor from "./pages/DataEditor"
import ScraperConfig from "./pages/ScraperConfig"
import Wizard from "./pages/Wizard"
import PdfResult from "./pages/PdfResult"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Wizard />} />
        <Route path="/editor" element={<DataEditor />} />
        <Route path="/scraper" element={<ScraperConfig />} />
        <Route path="/home" element={<Home />} />
        <Route path="/pdf" element={<PdfResult />} />
      </Routes>
    </BrowserRouter>
  )
}
