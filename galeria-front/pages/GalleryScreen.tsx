import React, { useEffect, useState } from "react";
import { fetchImages, ImageItem } from "../services/s3Service";
import QRCodeModal from "../components/QRCodeModal";
import "./GalleryScreen.css";

const MAX_IMAGES = 30;

const GalleryScreen: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [multipleImagesUrls, setMultipleImagesUrls] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  const areImageListsEqual = (list1: ImageItem[], list2: ImageItem[]) => {
    if (list1.length !== list2.length) return false;
    return list1.every(
      (img, idx) => img.nome === list2[idx].nome && img.url === list2[idx].url
    );
  };

  const loadImages = async () => {
    try {
      const result = await fetchImages();
      if (result.length > MAX_IMAGES) {
        result.splice(MAX_IMAGES);
      }

      const shouldUpdate = !areImageListsEqual(images, result);
      if (shouldUpdate) {
        setImages(result);
        const availableNames = result.map((img) => img.nome);
        const stillSelected = selected.filter((name) => availableNames.includes(name));
        setSelected(stillSelected);
      }
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const watchImages = async () => {
      while (isMounted) {
        if (selected.length === 0) {
          await loadImages();
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    };

    setLoading(true);
    loadImages().then(() => {
      setLoading(false);
      watchImages();
    });

    return () => {
      isMounted = false;
    };
  }, [selected]);

  const handleSelect = (filename: string) => {
    setSelected((prev) =>
      prev.includes(filename)
        ? prev.filter((name) => name !== filename)
        : [...prev, filename]
    );
  };

  const handleDownloadQRCode = () => {
    if (selected.length === 1) {
      const img = images.find((i) => i.nome === selected[0]);
      if (img) {
        setSelectedImageUrl(img.url);
        setMultipleImagesUrls(null);
      }
    } else if (selected.length > 1) {
      const selectedUrls = images
        .filter((img) => selected.includes(img.nome))
        .map((img) => img.url);
      setMultipleImagesUrls(selectedUrls);
      setSelectedImageUrl(null);
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
          {images.map((img) => {
            const isSelected = selected.includes(img.nome);
            return (
              <label
                className={`image-container ${isSelected ? "selected" : ""}`}
                key={img.id ?? img.nome}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelect(img.nome)}
                  className="select-checkbox"
                />
                <div className="foto-wrapper">
                  <img
                    src={img.url}
                    alt={`Imagem ${img.nome}`}
                    className="image-item"
                    loading="lazy"
                    onError={(e) => {
                      console.warn("⚠️ Erro inicial ao carregar imagem:", img.url);
                      // Retry após 2 segundos
                      setTimeout(() => {
                        (e.target as HTMLImageElement).src = img.url;
                      }, 2000);
                    }}
                    onLoad={() => {
                      console.log("✅ Imagem carregada com sucesso:", img.url);
                    }}
                  />
                </div>
                <p className="image-name">Imagem {img.nome}</p>
              </label>
            );
          })}
        </div>
      )}

      {(selectedImageUrl || multipleImagesUrls) && (
        <QRCodeModal
          imageUrl={selectedImageUrl || ""}
          multipleImages={multipleImagesUrls || undefined}
          onClose={() => {
            setSelectedImageUrl(null);
            setMultipleImagesUrls(null);
          }}
        />
      )}
    </div>
  );
};

export default GalleryScreen;
