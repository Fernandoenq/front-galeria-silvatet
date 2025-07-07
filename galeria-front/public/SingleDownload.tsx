import React, { useEffect, useState } from "react";
import "./SingleDownload.css";

const S3_BUCKET = import.meta.env.VITE_S3_BUCKET_NAME;
const AWS_REGION = import.meta.env.VITE_AWS_REGION;

const SingleDownload: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nomeParam = params.get("imagens");

    if (nomeParam) {
      const nomes = nomeParam
        .split(",")
        .map((n) => decodeURIComponent(n.trim()))
        .filter((n) => n !== "");

      if (nomes.length > 0) {
        const name = nomes[0]; // Usa apenas a primeira
        setFileName(name);
        const fullUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${name}`;
        setFileUrl(fullUrl);

        // Detectar tipo de arquivo pela extensão
        const extension = name.split(".").pop()?.toLowerCase();
        if (extension) {
          if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
            setFileType("image");
          } else if (["mp4", "webm", "ogg"].includes(extension)) {
            setFileType("video");
          } else {
            setFileType(null);
          }
        }
      }
    }
  }, []);

  if (!fileUrl || !fileName || !fileType) {
    return (
      <div className="multi-container">
        <h2>Nenhum arquivo encontrado.</h2>
        <p>Verifique se o link está correto ou se o formato é suportado.</p>
      </div>
    );
  }

  return (
    <div className="multi-container">
      <h1>Download do Arquivo</h1>
      <div className="img-block">
        {fileType === "image" && (
          <img
            src={fileUrl}
            alt="imagem"
            onError={(e) => {
              console.error("❌ Erro ao carregar imagem:", fileUrl);
              (e.target as HTMLImageElement).src =
                "https://placehold.co/300x400?text=Erro+na+imagem";
            }}
          />
        )}
        {fileType === "video" && (
          <video controls width="300">
            <source src={fileUrl} />
            Seu navegador não suporta vídeo.
          </video>
        )}
        <a className="btn" href={fileUrl} download={fileName}>
          ⬇️ Baixar {fileType === "image" ? "imagem" : "vídeo"}
        </a>
      </div>
    </div>
  );
};

export default SingleDownload;
