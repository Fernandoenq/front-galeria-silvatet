import { jsx as _jsx } from "react/jsx-runtime";
import "./SplashScreen.css";
const SplashScreen = ({ onClick }) => {
    return (_jsx("div", { className: "splash-screen", onClick: onClick, children: _jsx("img", { src: "/assets/logo2.png", alt: "Logo", className: "splash-logo" }) }));
};
export default SplashScreen;
