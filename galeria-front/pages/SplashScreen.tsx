import React from "react";
import "./SplashScreen.css";

interface Props {
  onClick: () => void;
}

const SplashScreen: React.FC<Props> = ({ onClick }) => {
  return (
    <div className="splash-screen" onClick={onClick}>
      {/* Logo central */}
      <img src="/assets/logo2.png" alt="Logo" className="splash-logo" />
    </div>
  );
};

export default SplashScreen;
