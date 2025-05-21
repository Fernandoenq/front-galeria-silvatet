import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { fetchImages, getDownloadLink } from "../services/s3Service";
import QRCodeModal from "../components/QRCodeModal";
import "./GalleryScreen.css";

interface ImageItem {
  nome: string;
  url: string;
}

interface SelectedImageInfo {
  originalUrl: string;
  downloadUrl: string;
}

const renderImageWithEffects = async (
  imageUrl: string,
  molduraUrl: string | null,
  filtro: string
): Promise<Blob> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = async () => {
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

      if (molduraUrl) {
        const molduraImg = new Image();
        molduraImg.crossOrigin = "anonymous";
        molduraImg.src = molduraUrl;

        await new Promise((res) => {
          molduraImg.onload = () => {
            ctx.drawImage(molduraImg, 0, 0, canvas.width, canvas.height);
            res(true);
          };
        });
      }

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, "image/png");
    };
  });
};

const GalleryScreen: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<SelectedImageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [moldura, setMoldura] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>("");

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        const result = await fetchImages();
        setImages(result);
      } catch (error) {
        console.error("Erro ao carregar imagens:", error);
      } finally {
        setLoading(false);
      }
    };

    const molduraSalva = localStorage.getItem("molduraSelecionada");
    if (molduraSalva) {
      setMoldura(molduraSalva);
    }

    const filtroSalvo = localStorage.getItem("filtroSelecionado");
    if (filtroSalvo) {
      setFiltro(filtroSalvo);
    }

    loadImages();
  }, []);

  const handleSelect = (filename: string) => {
    setSelected((prev) =>
      prev.includes(filename)
        ? prev.filter((name) => name !== filename)
        : [...prev, filename]
    );
  };

  const handleClickImage = async (img: ImageItem) => {
    const blob = await renderImageWithEffects(img.url, moldura, filtro);
    const fileUrl = URL.createObjectURL(blob);

    setSelectedImage({
      originalUrl: fileUrl,
      downloadUrl: fileUrl,
    });
  };

  const handleDownloadQRCode = async () => {
    if (selected.length === 1) {
      const selectedImg = images.find((img) => img.nome === selected[0]);
      if (selectedImg) {
        const blob = await renderImageWithEffects(selectedImg.url, moldura, filtro);
        const fileUrl = URL.createObjectURL(blob);

        setSelectedImage({
          originalUrl: fileUrl,
          downloadUrl: fileUrl,
        });
      }
    } else if (selected.length > 1) {
      const blobs = await Promise.all(
        selected.map((name) => {
          const img = images.find((i) => i.nome === name);
          if (!img) return null;
          return renderImageWithEffects(img.url, moldura, filtro);
        })
      );

      const zip = new JSZip();
      blobs.forEach((blob, i) => {
        if (blob) {
          zip.file(`imagem${i + 1}.png`, blob);
        }
      });

      const content = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(content);

      setSelectedImage({
        originalUrl: zipUrl,
        downloadUrl: zipUrl,
      });
    }
  };

  return (
    <div className="gallery-screen">
      {selected.length > 0 && (
        <button className="generate-qr-btn" onClick={handleDownloadQRCode}>
          📅 Gerar QRCode para {selected.length} imagem{selected.length > 1 ? "s" : ""}
        </button>
      )}

      {loading ? (
        <p className="text-center text-white">Carregando imagens...</p>
      ) : images.length === 0 ? (
        <p className="text-center text-white">Nenhuma imagem disponível.</p>
      ) : (
        <div className="image-grid">
          {images.map((img, idx) => {
            const isSelected = selected.includes(img.nome);
            return (
              <div className="image-container" key={idx}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelect(img.nome)}
                  className="select-checkbox"
                />
                <div className="foto-wrapper" onClick={() => handleClickImage(img)}>
                  <img
                    src={img.url}
                    alt={img.nome}
                    className={`image-item ${filtro}`}
                    loading="lazy"
                  />
                </div>
                <p className="image-name">{img.nome}</p>
              </div>
            );
          })}
        </div>
      )}

      {selectedImage && (
        <QRCodeModal
          imageUrl={selectedImage.originalUrl}
          qrCodeLink={selectedImage.downloadUrl}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default GalleryScreen;
