import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, } from "react-router-dom";
import SplashScreen from "../pages/SplashScreen";
import GalleryScreen from "../pages/GalleryScreen";
import CapturaLead from "../public/CapturaLead";
import MultiDownload from "../public/MultiDownload";
import SingleDownload from "../public/SingleDownload";
const ConditionalRoutes = () => {
    // ⛏️ ALTERADO: começa direto na galeria
    const [tela, setTela] = useState("galeria");
    const location = useLocation();
    const isDireto = ["/captura-lead", "/multi-download", "/download"].includes(location.pathname);
    if (tela === "splash" && !isDireto) {
        return _jsx(SplashScreen, { onClick: () => setTela("galeria") });
    }
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(GalleryScreen, {}) }), _jsx(Route, { path: "/captura-lead", element: _jsx(CapturaLead, {}) }), _jsx(Route, { path: "/multi-download", element: _jsx(MultiDownload, {}) }), _jsx(Route, { path: "/download", element: _jsx(SingleDownload, {}) })] }));
};
function App() {
    return (_jsx(Router, { children: _jsx(ConditionalRoutes, {}) }));
}
export default App;
