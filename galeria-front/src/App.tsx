// App.tsx
import { Routes, Route } from "react-router-dom";
import SplashScreen from "../pages/SplashScreen";
import MolduraScreen from "../pages/MolduraScreen";
import GalleryScreen from "../pages/GalleryScreen";
import CapturaLeadScreen from "../pages/CapturaLeadScreen";
import MultiDownloadScreen from "../pages/MultiDownloadScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/moldura" element={<MolduraScreen />} />
      <Route path="/galeria" element={<GalleryScreen />} />
      <Route path="/captura-lead" element={<CapturaLeadScreen />} />
      <Route path="/multi-download" element={<MultiDownloadScreen />} />
    </Routes>
  );
}

export default App;
