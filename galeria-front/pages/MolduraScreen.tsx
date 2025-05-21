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
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Carrega molduras armazenadas no sessionStorage
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
          id: Date.now(), // ID único baseado em timestamp
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

  const handleConfirmar = () => {
    if (selecionada !== null) {
      localStorage.setItem("molduraSelecionada", molduras.find(m => m.id === selecionada)?.src || "");
      onConfirm();
    } else {
      alert("Selecione uma moldura antes de continuar.");
    }
  };

  return (
    <div className="container">
      {/* Engrenagem para upload */}
      <div className="gear-icon" onClick={handleGearClick}>
        ⚙️
      </div>

      {/* Upload invisível */}
      <input
        type="file"
        accept="image/png, image/jpeg"
        ref={fileInputRef}
        onChange={handleUploadMoldura}
        style={{ display: "none" }}
      />

      <h2>Escolha sua moldura</h2>

      <div className="grid">
        {molduras.map((moldura) => (
          <div
            key={moldura.id}
            className={`item ${selecionada === moldura.id ? "selected" : ""}`}
            onClick={() => setSelecionada(moldura.id)}
          >
            <img src={moldura.src} alt={moldura.nome} />
            <p>{moldura.nome}</p>
          </div>
        ))}
      </div>

      <button className="confirmar" onClick={handleConfirmar}>
        Confirmar moldura
      </button>
    </div>
  );
};

export default MolduraScreen;
