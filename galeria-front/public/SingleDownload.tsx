import React, { useEffect, useState } from "react";
import "./SingleDownload.css";

const S3_BUCKET = import.meta.env.VITE_S3_BUCKET_NAME;
const AWS_REGION = import.meta.env.VITE_AWS_REGION;

const SingleDownload: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nomeParam = params.get("imagens");

    if (nomeParam) {
      const nomes = nomeParam
        .split(",")
        .map((n) => decodeURIComponent(n.trim()))
        .filter((n) => n !== "");

      if (nomes.length > 0) {
        const name = nomes[0]; // usa apenas a primeira imagem
        setImageName(name);
        const fullUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${name}`;
        setImageUrl(fullUrl);
      }
    }
  }, []);

  if (!imageUrl || !imageName) {
    return (
      <div className="multi-container">
        <h2>Nenhuma imagem encontrada.</h2>
        <p>Verifique se o link está correto.</p>
      </div>
    );
  }

  return (
    <div className="multi-container">
      <h1>Download da Imagem</h1>
      <div className="img-block">
        <img
          src={imageUrl}
          alt="imagem"
          onError={(e) => {
            console.error("❌ Erro ao carregar imagem:", imageUrl);
            (e.target as HTMLImageElement).src =
              "https://placehold.co/300x400?text=Erro+na+imagem";
          }}
        />
        <a className="btn" href={imageUrl} download={imageName}>
          ⬇️ Baixar imagem
        </a>
      </div>
    </div>
  );
};

export default SingleDownload;
