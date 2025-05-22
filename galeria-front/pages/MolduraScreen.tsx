import React, { useState, useRef, useEffect } from "react";
import "./MolduraScreen.css";

interface Moldura {
  id: number;
  src: string;
  nome: string;
}

interface Props {
  onConfirm: () => void;
}

const MolduraScreen: React.FC<Props> = ({ onConfirm }) => {
  const [molduras, setMolduras] = useState<Moldura[]>([]);
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const salvas = sessionStorage.getItem("moldurasImportadas");
    if (salvas) {
      setMolduras(JSON.parse(salvas));
    }
  }, []);

  const handleGearClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadMoldura = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const novaMoldura: Moldura = {
          id: Date.now(),
          src: reader.result as string,
          nome: file.name,
        };

        setMolduras((prev) => {
          const atualizadas = [...prev, novaMoldura];
          sessionStorage.setItem("moldurasImportadas", JSON.stringify(atualizadas));
          return atualizadas;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelecionada = (id: number) => {
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAvancar = () => {
    const selecionadasInfo = molduras.filter((m) => selecionadas.includes(m.id));
    sessionStorage.setItem("moldurasSelecionadas", JSON.stringify(selecionadasInfo));
    localStorage.setItem("molduraSelecionada", selecionadasInfo[0]?.src || "");
    onConfirm(); // troca para tela de galeria
  };

  return (
    <div className="container">
      <div className="gear-icon" onClick={handleGearClick}>⚙️</div>

      <input
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={handleUploadMoldura}
        style={{ display: "none" }}
      />

      <h2>Molduras carregadas</h2>

      <div className="grid">
        {molduras.map((moldura) => (
          <div
            key={moldura.id}
            className={`item ${selecionadas.includes(moldura.id) ? "ativa" : ""}`}
            onClick={() => toggleSelecionada(moldura.id)}
          >
            <img src={moldura.src} alt={moldura.nome} />
            <p>{moldura.nome}</p>
          </div>
        ))}
      </div>

      {selecionadas.length > 0 && (
        <button className="confirmar" onClick={handleAvancar}>
          Avançar
        </button>
      )}
    </div>
  );
};

export default MolduraScreen;
