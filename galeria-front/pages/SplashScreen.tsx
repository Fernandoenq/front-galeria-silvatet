import React, { useState } from "react";
import "./SplashScreen.css";

interface Props {
  onClick: () => void;
}

const effects = [
  { nome: "Nenhum", class: "" },
  { nome: "Efeito Tumblr", class: "effect-tumblr" },
  { nome: "Efeito Prism", class: "effect-prism" },
  { nome: "Efeito Pretty Freckles", class: "effect-freckles" },
  { nome: "Efeito Vintage", class: "effect-vintage" },
  { nome: "Efeito Silly Face", class: "effect-silly" },
  { nome: "Efeito Preto e Branco", class: "effect-preto-branco" },
];

const SplashScreen: React.FC<Props> = ({ onClick }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState(
    localStorage.getItem("filtroSelecionado") || ""
  );

  const handleConfigClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFilters((prev) => !prev);
  };

  const handleEffectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedEffect(value);
    localStorage.setItem("filtroSelecionado", value);
  };

  return (
    <div className="splash-screen" onClick={onClick}>
      {/* Engrenagem */}
      <button className="gear-button" onClick={handleConfigClick}>
        ⚙️
      </button>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
          <h4>🎛️ Escolha um filtro:</h4>
          <select value={selectedEffect} onChange={handleEffectChange}>
            {effects.map((ef, idx) => (
              <option key={idx} value={ef.class}>
                {ef.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Logo central */}
      <img src="/assets/logo2.png" alt="Logo" className="splash-logo" />
    </div>
  );
};

export default SplashScreen;
