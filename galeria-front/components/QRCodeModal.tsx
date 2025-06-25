import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import "./QRCodeModal.css";

const GALLERY_API_URL = import.meta.env.VITE_GALLERY_API_URL || "http://localhost:3333";
const BASE_URL = import.meta.env.VITE_PUBLIC_HOST || window.location.origin;

interface QRCodeModalProps {
  imageUrl: string;
  onClose: () => void;
  multipleImages?: string[];
}

interface PrintItem {
  nome: string;
  url: string;
  quantidade: number;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  imageUrl,
  onClose,
  multipleImages,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(imageUrl);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [orientacao, setOrientacao] = useState<"portrait" | "landscape">("portrait");
  const [printList, setPrintList] = useState<PrintItem[]>([]);

  useEffect(() => {
    setQrUrl("");
    setPrintList([]);

    if (multipleImages?.length) {
      setPreviewUrl(multipleImages[0]);
      prepararMultiplas(multipleImages);
    } else {
      prepararUnica(imageUrl);
    }
  }, [imageUrl, multipleImages]);

  const prepararMultiplas = (urls: string[]) => {
    const generatedList: PrintItem[] = urls.map((url) => ({
      nome: extrairNomeArquivo(url),
      url,
      quantidade: 1,
    }));

    setPrintList(generatedList);

    const joined = generatedList.map((i) => encodeURIComponent(i.nome)).join(",");
    const redirectUrl = `/multi-download?imagens=${joined}`;
    const fullUrl = `${BASE_URL}/captura-lead?redirect=${encodeURIComponent(redirectUrl)}`;
    setQrUrl(fullUrl);
  };

  const prepararUnica = (url: string) => {
    const nome = extrairNomeArquivo(url);
    setPreviewUrl(url);
    setPrintList([{ nome, url, quantidade: 1 }]);

    const redirectUrl = `/download?imagens=${encodeURIComponent(nome)}`; // ✅ Encode aqui
    const fullUrl = `${BASE_URL}/captura-lead?redirect=${encodeURIComponent(redirectUrl)}`; // ✅ Encode aqui
    setQrUrl(fullUrl);
  };

  const extrairNomeArquivo = (url: string): string => {
    const partes = url.split("/");
    return partes[partes.length - 1].split("?")[0];
  };

  const enviarParaImpressao = async () => {
    try {
      const body = printList.map(({ nome, quantidade }) => ({ nome, quantidade }));
      const response = await fetch(`${GALLERY_API_URL}/marcar-para-impressao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Erro na requisição");
      alert("✅ Imagens enviadas para impressão");
    } catch (err) {
      console.error("❌ Erro ao marcar imagem para impressão:", err);
      alert("❌ Erro ao enviar para impressão");
    }
  };

  const updateQuantity = (index: number, value: number) => {
    setPrintList((prev) => {
      const updated = [...prev];
      updated[index].quantidade = value;
      return updated;
    });
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        {!multipleImages?.length && (
          <>
            <div className="foto-wrapper">
              <img
                src={previewUrl}
                alt="Imagem final"
                className="qr-modal-image"
                onError={(e) => {
                  console.error("❌ Erro ao carregar preview:", previewUrl);
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/300x400?text=Erro+na+imagem";
                }}
              />
            </div>
            <button
              style={{ margin: "16px auto", padding: "8px 16px" }}
              onClick={() =>
                setOrientacao((prev) =>
                  prev === "portrait" ? "landscape" : "portrait"
                )
              }
            >
              Modo: {orientacao === "portrait" ? "Retrato (9:16)" : "Paisagem (16:9)"}
            </button>
          </>
        )}

        {qrUrl && (
          <>
            <p className="qr-modal-text">Escaneie para baixar</p>
            <div className="qr-code-wrapper">
              <QRCode value={qrUrl} size={180} />
            </div>
          </>
        )}

        {printList.length > 0 && (
          <div className="qr-carousel-container">
            <h3 className="qr-carousel-title">Imagens selecionadas</h3>
            <div className="qr-carousel-scroll">
              {printList.map((item, idx) => (
                <div key={idx} className="qr-carousel-card">
                  <img
                    src={item.url}
                    alt={`preview-${idx}`}
                    className="qr-carousel-image"
                    onError={(e) => {
                      console.error(`❌ Erro ao carregar miniatura ${item.url}`);
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/150x200?text=Erro";
                    }}
                  />
                  <div className="qr-carousel-controls">
                    <label htmlFor={`qtd-${idx}`}>Quantidade:</label>
                    <input
                      id={`qtd-${idx}`}
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => {
                        const value = Math.max(1, parseInt(e.target.value) || 1);
                        updateQuantity(idx, value);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="qr-print-button" onClick={enviarParaImpressao}>
              Enviar para Impressão
            </button>
          </div>
        )}

        <button className="qr-modal-close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
