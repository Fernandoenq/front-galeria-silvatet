import { useState } from "react";
import SplashScreen from "../pages/SplashScreen";
import GalleryScreen from "../pages/GalleryScreen";


function App() {
  const [started, setStarted] = useState(false);

  return started ? <GalleryScreen /> : <SplashScreen onClick={() => setStarted(true)} />;
}

export default App;