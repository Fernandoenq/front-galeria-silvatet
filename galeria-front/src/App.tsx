import SplashScreen from "../pages/SplashScreen";
import MolduraScreen from "../pages/MolduraScreen";
import GalleryScreen from "../pages/GalleryScreen";
import { useState } from "react";

function App() {
  const [tela, setTela] = useState<"splash" | "moldura" | "galeria">("splash");

  if (tela === "splash") return <SplashScreen onClick={() => setTela("moldura")} />;
  if (tela === "moldura") return <MolduraScreen onConfirm={() => setTela("galeria")} />;
  return <GalleryScreen />;
}

export default App;
