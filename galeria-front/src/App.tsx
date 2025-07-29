import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import SplashScreen from "../pages/SplashScreen";
import GalleryScreen from "../pages/GalleryScreen";
import CapturaLead from "../public/CapturaLead";
import MultiDownload from "../public/MultiDownload";
import SingleDownload from "../public/SingleDownload";

const ConditionalRoutes = () => {
  // ⛏️ ALTERADO: começa direto na galeria
  const [tela, setTela] = useState<"splash" | "galeria">("galeria");
  const location = useLocation();

  const isDireto = ["/captura-lead", "/multi-download", "/download"].includes(
    location.pathname
  );

  if (tela === "splash" && !isDireto) {
    return <SplashScreen onClick={() => setTela("galeria")} />;
  }

  return (
    <Routes>
      <Route path="/" element={<GalleryScreen />} />
      <Route path="/captura-lead" element={<CapturaLead />} />
      <Route path="/multi-download" element={<MultiDownload />} />
      <Route path="/download" element={<SingleDownload />} />
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
