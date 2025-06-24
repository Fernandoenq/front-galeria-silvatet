import React, { useEffect, useState } from "react";
import "./MultiDownload.css";

const GALLERY_API_URL =
  import.meta.env.VITE_GALLERY_API_URL || "http://localhost:3333";

interface ImageData {
  nome: string;
  url: string;
}

const MultiDownload: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nomes = params.get("imagens")?.split(",") || [];
    const decoded = nomes.map((nome) => decodeURIComponent(nome.trim()));
    const imgData = decoded.map((nome) => ({
      nome,
      url: `${GALLERY_API_URL}/uploaded/${nome}`,
    }));
    setImages(imgData);
  }, []);

  if (images.length === 0) {
    return (
      <div className="multi-container">
        <h2>Nenhuma imagem selecionada.</h2>
        <p>Certifique-se de acessar este link corretamente pelo QR Code.</p>
      </div>
    );
  }

  return (
    <div className="multi-container">
      <h1>Imagens para Download</h1>

      <div className="multi-grid">
        {images.map((img, idx) => (
          <div className="img-block" key={idx}>
            <img src={img.url} alt={`imagem-${idx + 1}`} />
            <a
              className="btn"
              href={img.url}
              download={`imagem-${idx + 1}.png`}
            >
              ⬇️ Baixar imagem {idx + 1}
            </a>
          </div>
        ))}
      </div>

      {/* Botão de baixar tudo - você pode ativar isso futuramente */}
      {/* <form method="POST" action={`${GALLERY_API_URL}/download-multi`}>
        <input
          type="hidden"
          name="filenames"
          value={images.map((i) => i.nome).join(",")}
        />
        <button className="btn-download-all" type="submit">
          📦 Baixar todas como ZIP
        </button>
      </form> */}
    </div>
  );
};

export default MultiDownload;
