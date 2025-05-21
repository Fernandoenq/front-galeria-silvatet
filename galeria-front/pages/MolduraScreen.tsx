import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    // Molduras pré-carregadas (armazenadas em /public/assets/molduras/)
    const moldurasExemplo: Moldura[] = [
      { id: 1, src: "/assets/molduras/moldura1.png", nome: "Moldura 1" },
      { id: 2, src: "/assets/molduras/moldura2.png", nome: "Moldura 2" },
      { id: 3, src: "/assets/molduras/moldura3.png", nome: "Moldura 3" },
      { id: 4, src: "/assets/molduras/moldura4.png", nome: "Moldura 4" },
    ];
    setMolduras(moldurasExemplo);
  }, []);

  const handleConfirmar = () => {
    if (selecionada !== null) {
      localStorage.setItem("molduraSelecionada", molduras[selecionada].src);
      onConfirm(); // Avança para a galeria
    } else {
      alert("Selecione uma moldura antes de continuar.");
    }
  };

  const handleUploadMoldura = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const novaMoldura: Moldura = {
          id: molduras.length + 1,
          src: reader.result as string,
          nome: file.name,
        };
        setMolduras((prev) => [...prev, novaMoldura]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container">
      <h2>Escolha sua moldura</h2>

      {/* Upload manual da moldura */}
      <input
        className="upload"
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleUploadMoldura}
      />

      <div className="grid">
        {molduras.map((moldura, index) => (
          <div
            key={moldura.id}
            className={`item ${selecionada === index ? "selected" : ""}`}
            onClick={() => setSelecionada(index)}
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
