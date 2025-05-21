import React, { useEffect, useState } from "react";
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

  const handleDownloadQRCode = () => {
    if (selected.length === 1) {
      const selectedImg = images.find((img) => img.nome === selected[0]);
      if (selectedImg) {
        const downloadUrl = getDownloadLink(selectedImg.nome);
        setSelectedImage({
          originalUrl: selectedImg.url,
          downloadUrl,
        });
      }
    } else if (selected.length > 1) {
      const links = selected.map((name) => getDownloadLink(name));
      const combinedUrl = `https://seusite.com/multi-download.html?links=${encodeURIComponent(
        links.join(",")
      )}`;
      setSelectedImage({
        originalUrl: combinedUrl,
        downloadUrl: combinedUrl,
      });
    }
  };

  return (
    <div className="gallery-screen">
      {selected.length > 0 && (
        <button className="generate-qr-btn" onClick={handleDownloadQRCode}>
          📥 Gerar QRCode para {selected.length} imagem{selected.length > 1 ? "s" : ""}
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
                <div className="foto-wrapper">
                  <img
                    src={img.url}
                    alt={img.nome}
                    className={`image-item ${filtro}`}
                    loading="lazy"
                  />
                  {moldura && (
                    <img
                      src={moldura}
                      alt="moldura"
                      className="moldura-sobreposta"
                    />
                  )}
                </div>
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
