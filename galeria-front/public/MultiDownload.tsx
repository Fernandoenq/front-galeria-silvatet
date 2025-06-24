import React, { useEffect, useState } from "react";
import "./MultiDownload.css";

const S3_BUCKET = import.meta.env.VITE_S3_BUCKET_NAME;
const AWS_REGION = import.meta.env.VITE_AWS_REGION;

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
      url: `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${nome}`,
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
            <a className="btn" href={img.url} download={`imagem-${idx + 1}.png`}>
              ⬇️ Baixar imagem {idx + 1}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiDownload;
