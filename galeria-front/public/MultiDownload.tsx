import React, { useEffect, useState } from "react";
import "./MultiDownload.css";

const S3_BUCKET = import.meta.env.VITE_S3_BUCKET_NAME;
const AWS_REGION = import.meta.env.VITE_AWS_REGION;

interface FileData {
  nome: string;
  url: string;
  tipo: "image" | "video" | "unknown";
}

const MultiDownload: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nomes = params.get("imagens")?.split(",") || [];
    const decoded = nomes
      .map((nome) => decodeURIComponent(nome.trim()))
      .filter((n) => n !== "");

    const fileData = decoded.map((nome) => {
      const extension = nome.split(".").pop()?.toLowerCase();
      let tipo: "image" | "video" | "unknown" = "unknown";
      if (extension) {
        if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
          tipo = "image";
        } else if (["mp4", "webm", "ogg"].includes(extension)) {
          tipo = "video";
        }
      }
      return {
        nome,
        url: `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${nome}`,
        tipo,
      };
    });

    setFiles(fileData);
  }, []);

  if (files.length === 0) {
    return (
      <div className="multi-container">
        <h2>Nenhum arquivo selecionado.</h2>
        <p>Certifique-se de acessar este link corretamente pelo QR Code.</p>
      </div>
    );
  }

  return (
    <div className="multi-container">
      <h1>Arquivos para Download</h1>

      <div className="multi-grid">
        {files.map((file, idx) => (
          <div className="img-block" key={idx}>
            {file.tipo === "image" && (
              <img
                src={file.url}
                alt={`imagem-${idx + 1}`}
                onError={(e) => {
                  console.error("❌ Erro ao carregar imagem:", file.url);
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/300x400?text=Erro+na+imagem";
                }}
              />
            )}

            {file.tipo === "video" && (
              <video controls width="300">
                <source src={file.url} />
                Seu navegador não suporta vídeo.
              </video>
            )}

            {file.tipo === "unknown" && (
              <p>Arquivo não suportado: {file.nome}</p>
            )}

            <a className="btn" href={file.url} download={file.nome}>
              ⬇️ Baixar {file.tipo === "image" ? "imagem" : file.tipo === "video" ? "vídeo" : "arquivo"}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiDownload;
