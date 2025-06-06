import React, { useEffect, useRef, useState } from "react";
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
  const [selectedEffect, setSelectedEffect] = useState<string>(
    localStorage.getItem("filtroSelecionado") || ""
  );

  // Ref para saber se o componente está montado
  const isMounted = useRef(true);

  // Ref para controlar o estado de seleção de imagens
  const selectedRef = useRef<string[]>([]);
  selectedRef.current = selected;

  const areImageListsEqual = (list1: ImageItem[], list2: ImageItem[]) => {
    if (list1.length !== list2.length) return false;
    return list1.every(
      (img, idx) => img.nome === list2[idx].nome && img.url === list2[idx].url
    );
  };

  const loadImages = async () => {
  try {
    const result = await fetchImages();
    const shouldUpdate = !areImageListsEqual(images, result);
    if (shouldUpdate) {
      setImages(result);

      // ✅ Remove da seleção qualquer imagem que não esteja mais na lista atual
      const availableNames = result.map((img) => img.nome);
      const stillSelected = selectedRef.current.filter((name) =>
        availableNames.includes(name)
      );
      setSelected(stillSelected);
    }
  } catch (error) {
    console.error("Erro ao carregar imagens:", error);
  }
};


useEffect(() => {
  isMounted.current = true;
  loadImages().then(() => setLoading(false));
  return () => {
    isMounted.current = false;
  };
}, []);


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

      <button className="update-images-btn" onClick={async () => {
        setLoading(true);
        await loadImages();
        setSelected([]); // ✅ limpa a seleção
        setLoading(false);
      }}>
        🔄 Atualizar imagens
      </button>


      {loading ? (
        <p className="text-center text-white">Carregando imagens...</p>
      ) : images.length === 0 ? (
        <p className="text-center text-white">Nenhuma imagem disponível.</p>
      ) : (
        <div className="image-grid">
          {images.map((img, idx) => {
  const isSelected = selected.includes(img.nome);
  return (
    <div
      className={`image-container ${isSelected ? "selected" : ""}`}
      key={idx}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSelect(img.nome);
      }}
    >
      <div className="foto-wrapper">
        <img
          src={img.url}
          alt={img.nome}
          className={`image-item ${selectedEffect}`}
          loading="lazy"
        />
      </div>
      <p className="image-name">{img.nome}</p>
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
