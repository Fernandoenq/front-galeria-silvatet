import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import "./QRCodeModal.css";

interface QRCodeModalProps {
  imageUrl: string;
  onClose: () => void;
  multipleImages?: string[];
}

interface Moldura {
  id: number;
  src: string;
  nome: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ imageUrl, onClose, multipleImages }) => {
  const [molduras, setMolduras] = useState<Moldura[]>([]);
  const [molduraSelecionada, setMolduraSelecionada] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(imageUrl);
  const [filtroSelecionado, setFiltroSelecionado] = useState<string>("");
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    console.log("🔄 useEffect ativado");
    const filtro = localStorage.getItem("filtroSelecionado") || "";
    setFiltroSelecionado(filtro);

    const selecionadas = sessionStorage.getItem("moldurasSelecionadas");
    if (selecionadas) {
      const lista = JSON.parse(selecionadas) as Moldura[];
      setMolduras(lista);
      const primeira = lista[0]?.src || null;
      if (primeira) {
        setMolduraSelecionada(primeira);
        if (multipleImages?.length) {
          console.log("📸 Modo múltiplas imagens:", multipleImages);
          setPreviewUrl(multipleImages[0]);
          renderMultipleWithEffects(multipleImages, primeira, filtro);
        } else {
          console.log("🖼️ Modo imagem única:", imageUrl);
          renderWithEffects(imageUrl, primeira, filtro);
        }
      } else {
        setPreviewUrl(imageUrl);
      }
    }
  }, [imageUrl, multipleImages]);

  const getFiltro = (filtro: string) => {
    switch (filtro) {
      case "effect-tumblr": return "saturate(1.4) hue-rotate(-20deg) contrast(1.1)";
      case "effect-prism": return "contrast(1.2) saturate(1.5) hue-rotate(45deg)";
      case "effect-freckles": return "brightness(1.05) contrast(1.05)";
      case "effect-vintage": return "sepia(0.3) contrast(0.9) brightness(1.1)";
      case "effect-silly": return "hue-rotate(180deg) saturate(2.5)";
      case "effect-preto-branco": return "grayscale(1)";
      default: return "none";
    }
  };

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

      ctx.filter = getFiltro(filtro);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = "none";

      const moldura = new Image();
      moldura.crossOrigin = "anonymous";
      moldura.src = molduraUrl;

      moldura.onload = () => {
        ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const tempUrl = URL.createObjectURL(blob);
            setPreviewUrl(tempUrl);

            const backendUrl = await enviarImagemParaBackend(blob);
            if (backendUrl) setQrUrl(backendUrl);
          }
        }, "image/png");
      };
    };
  };

  const renderMultipleWithEffects = async (urls: string[], molduraUrl: string, filtro: string) => {
    console.log("⚙️ Iniciando renderização múltipla");
    const generatedLinks: string[] = [];

    for (const url of urls) {
      const blob = await renderBlob(url, molduraUrl, filtro);
      const backendUrl = await enviarImagemParaBackend(blob);
      if (backendUrl) generatedLinks.push(backendUrl);
    }

    console.log("🔗 Links gerados:", generatedLinks);
    if (generatedLinks.length > 0) {
      const joined = generatedLinks.map(encodeURIComponent).join(",");
      const fullUrl = `http://192.168.0.12:5173/multi-download.html?imagens=${joined}`;
      console.log("✅ URL final do QR:", fullUrl);
      setQrUrl(fullUrl);
    } else {
      console.warn("⚠️ Nenhum link foi gerado para múltiplas imagens.");
    }
  };

  const renderBlob = (imgUrl: string, molduraUrl: string, filtro: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.filter = getFiltro(filtro);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";

        const moldura = new Image();
        moldura.crossOrigin = "anonymous";
        moldura.src = molduraUrl;

        moldura.onload = () => {
          ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
          }, "image/png");
        };
      };
    });
  };

  const enviarImagemParaBackend = async (blob: Blob): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", blob, "imagem-final.png");

    try {
      const res = await fetch("http://192.168.0.12:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("❌ Erro ao enviar imagem para backend:", error);
      return null;
    }
  };

  const handleSelectMoldura = (src: string) => {
    setMolduraSelecionada(src);
    if (multipleImages?.length) {
      setPreviewUrl(multipleImages[0]);
      renderMultipleWithEffects(multipleImages, src, filtroSelecionado);
    } else {
      renderWithEffects(imageUrl, src, filtroSelecionado);
    }
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
          {previewUrl && <img src={previewUrl} alt="Imagem final" className="qr-modal-image" />}
        </div>

        {molduras.length > 0 && (
          <div className="moldura-selector">
            <p className="qr-modal-text">Escolha a moldura:</p>
            <div className="moldura-lista">
              {molduras.map((m) => (
                <img
                  key={m.id}
                  src={m.src}
                  alt={m.nome}
                  className={`moldura-thumb ${m.src === molduraSelecionada ? "ativa" : ""}`}
                  onClick={() => handleSelectMoldura(m.src)}
                />
              ))}
            </div>
          </div>
        )}

        <p className="qr-modal-text">Escaneie para baixar</p>
        <div className="qr-code-wrapper">
          {qrUrl && <QRCode value={qrUrl} size={180} />}
        </div>

        {!multipleImages && (
          <button className="qr-modal-download" onClick={handleDownload}>
            ⬇️ Baixar imagem
          </button>
        )}
        <button className="qr-modal-close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
