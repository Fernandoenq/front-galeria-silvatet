// QRCodeModal.tsx
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

interface PrintItem {
  url: string;
  quantity: number;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ imageUrl, onClose, multipleImages }) => {
  const [molduras, setMolduras] = useState<Moldura[]>([]);
  const [molduraSelecionada, setMolduraSelecionada] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(imageUrl);
  const [filtroSelecionado, setFiltroSelecionado] = useState<string>("");
  const [qrUrl, setQrUrl] = useState<string>("");
  const [orientacao, setOrientacao] = useState<"portrait" | "landscape">("portrait");
  const [printList, setPrintList] = useState<PrintItem[]>([]);

  useEffect(() => {
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
          setPreviewUrl(multipleImages[0]);
          renderMultipleWithEffects(multipleImages, primeira, filtro);
        } else {
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

  const drawImageCentered = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvasWidth: number, canvasHeight: number, filtro: string) => {
    ctx.filter = getFiltro(filtro);
    const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
    const sw = img.width * scale;
    const sh = img.height * scale;
    const sx = (canvasWidth - sw) / 2;
    const sy = (canvasHeight - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh);
    ctx.filter = "none";
  };

  const renderMultipleWithEffects = async (urls: string[], molduraUrl: string, filtro: string) => {
    const generatedList: PrintItem[] = [];

    for (const url of urls) {
      const blob = await renderBlob(url, molduraUrl, filtro);
      const backendUrl = await enviarImagemParaBackend(blob);
      if (backendUrl) generatedList.push({ url: backendUrl, quantity: 0 });
    }

    setPrintList(generatedList);

    if (generatedList.length > 0) {
      const joined = generatedList.map(i => encodeURIComponent(i.url)).join(",");
      const redirectUrl = `http://192.168.0.12:5173/multi-download.html?imagens=${joined}`;
      const fullUrl = `http://192.168.0.12:5173/captura-lead.html?redirect=${encodeURIComponent(redirectUrl)}`;
      setQrUrl(fullUrl);
    }
  };

  const renderWithEffects = async (imgUrl: string, molduraUrl: string, filtro: string) => {
    const blob = await renderBlob(imgUrl, molduraUrl, filtro);
    const backendUrl = await enviarImagemParaBackend(blob);
    if (backendUrl) {
      setPreviewUrl(URL.createObjectURL(blob));
      setQrUrl(`http://192.168.0.12:5173/captura-lead.html?redirect=${encodeURIComponent(backendUrl)}`);
    }
  };

  const renderBlob = (imgUrl: string, molduraUrl: string, filtro: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgUrl.startsWith("data:") ? imgUrl : `${imgUrl}?t=${Date.now()}`;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = orientacao === "portrait" ? 1080 : 1920;
        canvas.height = orientacao === "portrait" ? 1920 : 1080;

        drawImageCentered(ctx, img, canvas.width, canvas.height, filtro);

        const moldura = new Image();
        moldura.crossOrigin = "anonymous";
        moldura.src = molduraUrl.startsWith("data:") ? molduraUrl : `${molduraUrl}?t=${Date.now()}`;

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

  const updateQuantity = (index: number, value: number) => {
    setPrintList(prev => {
      const updated = [...prev];
      updated[index].quantity = value;
      return updated;
    });
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

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="foto-wrapper">
          {previewUrl && <img src={previewUrl} alt="Imagem final" className="qr-modal-image" />}
        </div>

        <button
          style={{ margin: "16px auto", padding: "8px 16px" }}
          onClick={() => setOrientacao((prev) => (prev === "portrait" ? "landscape" : "portrait"))}
        >
          Modo: {orientacao === "portrait" ? "Retrato (9:16)" : "Paisagem (16:9)"}
        </button>

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

        {printList.length > 0 && (
          <div className="qr-carousel">
            {printList.map((item, idx) => (
              <div key={idx} className="qr-carousel-item">
                <img src={item.url} alt={`preview-${idx}`} className="qr-modal-image" />
                <label>Quantidade para imprimir:</label>
                <input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(idx, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
        )}

        <button className="qr-modal-close" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default QRCodeModal;
