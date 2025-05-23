import React, { useEffect, useState } from "react";
import { fetchImages } from "../services/s3Service";
import QRCodeModal from "../components/QRCodeModal";
import "./GalleryScreen.css";

interface ImageItem {
  nome: string;
  url: string;
}

const GalleryScreen: React.FC = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [multipleImagesUrls, setMultipleImagesUrls] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEffect] = useState<string>(
    localStorage.getItem("filtroSelecionado") || ""
  );

  const areImageListsEqual = (list1: ImageItem[], list2: ImageItem[]) => {
    if (list1.length !== list2.length) return false;
    const sorted1 = [...list1].sort((a, b) => a.nome.localeCompare(b.nome));
    const sorted2 = [...list2].sort((a, b) => a.nome.localeCompare(b.nome));
    return sorted1.every(
      (img, idx) => img.nome === sorted2[idx].nome && img.url === sorted2[idx].url
    );
  };

  const loadImages = async () => {
    try {
      const result = await fetchImages();
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
          {images.map((img, idx) => {
            const isSelected = selected.includes(img.nome);
            return (
              <div className="image-container" key={idx}>
                <label className="image-label">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelect(img.nome)}
                    className="select-checkbox"
                  />
                  <div className={`foto-wrapper ${isSelected ? "selected" : ""}`}>
                    <img
                      src={img.url}
                      alt={img.nome}
                      className={`image-item ${selectedEffect}`}
                      loading="lazy"
                    />
                  </div>
                  <p className="image-name">{img.nome}</p>
                </label>
              </div>
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
