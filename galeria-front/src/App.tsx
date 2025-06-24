import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import SplashScreen from "../pages/SplashScreen";
import GalleryScreen from "../pages/GalleryScreen";
import CapturaLead from "../public/CapturaLead";
import MultiDownload from "../public/MultiDownload";

const ConditionalRoutes = () => {
  const [tela, setTela] = useState<"splash" | "galeria">("splash");
  const location = useLocation();

  // Se está acessando direto por rota específica (ex: /captura-lead), ignora splash
  const isDireto = ["/captura-lead", "/multi-download"].includes(location.pathname);

  if (tela === "splash" && !isDireto) {
    return <SplashScreen onClick={() => setTela("galeria")} />;
  }

  return (
    <Routes>
      <Route path="/" element={<GalleryScreen />} />
      <Route path="/captura-lead" element={<CapturaLead />} />
      <Route path="/multi-download" element={<MultiDownload />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ConditionalRoutes />
    </Router>
  );
}

export default App;
