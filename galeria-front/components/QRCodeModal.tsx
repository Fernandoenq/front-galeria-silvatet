import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import "./QRCodeModal.css";

interface QRCodeModalProps {
  imageUrl: string;
  qrCodeLink: string;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ imageUrl, qrCodeLink, onClose }) => {
  const [molduras, setMolduras] = useState<string[]>([]);
  const [molduraSelecionada, setMolduraSelecionada] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(imageUrl);
  const [filtroSelecionado, setFiltroSelecionado] = useState<string>("");

  useEffect(() => {
    const salvas = localStorage.getItem("moldurasImportadas");
    if (salvas) {
      const lista = JSON.parse(salvas) as { src: string }[];
      setMolduras(lista.map((m) => m.src));
    }

    const inicial = localStorage.getItem("molduraSelecionada");
    const filtro = localStorage.getItem("filtroSelecionado") || "";
    setFiltroSelecionado(filtro);

    if (inicial) {
      setMolduraSelecionada(inicial);
      renderWithEffects(imageUrl, inicial, filtro);
    } else {
      setPreviewUrl(imageUrl);
    }
  }, [imageUrl]);

  const renderWithEffects = (imgUrl: string, molduraUrl: string, filtro: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      switch (filtro) {
        case "effect-tumblr":
          ctx.filter = "saturate(1.4) hue-rotate(-20deg) contrast(1.1)";
          break;
        case "effect-prism":
          ctx.filter = "contrast(1.2) saturate(1.5) hue-rotate(45deg)";
          break;
        case "effect-freckles":
          ctx.filter = "brightness(1.05) contrast(1.05)";
          break;
        case "effect-vintage":
          ctx.filter = "sepia(0.3) contrast(0.9) brightness(1.1)";
          break;
        case "effect-silly":
          ctx.filter = "hue-rotate(180deg) saturate(2.5)";
          break;
        case "effect-preto-branco":
          ctx.filter = "grayscale(1)";
          break;
        default:
          ctx.filter = "none";
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      const moldura = new Image();
      moldura.crossOrigin = "anonymous";
      moldura.src = molduraUrl;

      moldura.onload = () => {
        ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const newUrl = URL.createObjectURL(blob);
            setPreviewUrl(newUrl);
          }
        }, "image/png");
      };
    };
  };

  const handleSelectMoldura = (src: string) => {
    setMolduraSelecionada(src);
    localStorage.setItem("molduraSelecionada", src);
    renderWithEffects(imageUrl, src, filtroSelecionado);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = "imagem-final.png";
    a.click();
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="foto-wrapper">
          <img src={previewUrl} alt="Imagem final" className="qr-modal-image" />
        </div>

        {molduras.length > 0 && (
          <div className="moldura-selector">
            <p className="qr-modal-text">Escolha a moldura:</p>
            <div className="moldura-lista">
              {molduras.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Moldura ${idx + 1}`}
                  className={`moldura-thumb ${src === molduraSelecionada ? "ativa" : ""}`}
                  onClick={() => handleSelectMoldura(src)}
                />
              ))}
            </div>
          </div>
        )}

        <p className="qr-modal-text">Escaneie para baixar</p>
        <div className="qr-code-wrapper">
          <QRCode value={previewUrl} size={180} />
        </div>

        <button className="qr-modal-download" onClick={handleDownload}>
          ⬇️ Baixar imagem
        </button>
        <button className="qr-modal-close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
