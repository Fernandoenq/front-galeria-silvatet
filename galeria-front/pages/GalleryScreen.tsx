import React, { useEffect, useState } from "react";
import { fetchMedia, ImageItem } from "../services/s3Service";
import QRCodeModal from "../components/QRCodeModal";
import LeadSettings, { LeadConfig } from "./LeadSettings";
import "./GalleryScreen.css";

const MAX_ITEMS = 30;

const GalleryScreen: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<ImageItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [multipleImagesUrls, setMultipleImagesUrls] = useState<string[] | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [showSettings, setShowSettings] = useState(false);

  const [leadConfig, setLeadConfig] = useState<LeadConfig>({
    capturaLead: true,
    campoNome: true,
    campoEmail: true,
    campoTelefone: true,
    campoCPF: true,
  });

  const areListsEqual = (list1: ImageItem[], list2: ImageItem[]) => {
    if (list1.length !== list2.length) return false;
    return list1.every(
      (item, idx) => item.nome === list2[idx].nome && item.url === list2[idx].url
    );
  };

  const loadMedia = async (opts?: { refreshing?: boolean }) => {
    const refreshing = !!opts?.refreshing;
    try {
      if (refreshing) setIsRefreshing(true);
      const result = await fetchMedia(mediaType);
      if (result.length > MAX_ITEMS) {
        result.splice(MAX_ITEMS);
      }
      const shouldUpdate = !areListsEqual(mediaItems, result);
      if (shouldUpdate) {
        setMediaItems(result);
        const availableNames = result.map((item) => item.nome);
        const stillSelected = selected.filter((name) => availableNames.includes(name));
        setSelected(stillSelected);
      }
    } catch (error) {
      console.error("Erro ao carregar mídia:", error);
    } finally {
      if (initialLoading) setInitialLoading(false);
      if (isRefreshing) setTimeout(() => setIsRefreshing(false), 120); // dá tempo da transição
      if (!initialLoading && !isRefreshing) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const watchMedia = async () => {
      // loop leve: atualiza só quando nada selecionado
      while (isMounted) {
        if (selected.length === 0) {
          await loadMedia({ refreshing: true });
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    };

    // primeira carga
    loadMedia().then(() => {
      watchMedia();
    });

    return () => {
      isMounted = false;
    };
  }, [mediaType]); // ⇐ importante: não dependa de "selected" pra não reiniciar o loop

  const handleSelect = (filename: string) => {
    setSelected((prev) =>
      prev.includes(filename) ? prev.filter((name) => name !== filename) : [...prev, filename]
    );
  };

  const handleDownloadQRCode = () => {
    if (selected.length === 1) {
      const item = mediaItems.find((i) => i.nome === selected[0]);
      if (item) {
        setSelectedImageUrl(item.url);
        setMultipleImagesUrls(null);
      }
    } else if (selected.length > 1) {
      const selectedUrls = mediaItems
        .filter((i) => selected.includes(i.nome))
        .map((i) => i.url);
      setMultipleImagesUrls(selectedUrls);
      setSelectedImageUrl(null);
    }
  };

  const handleChangeMediaType = (value: "image" | "video") => {
    setMediaType(value);
    setSelected([]);
    // não mostra tela preta; só um overlay curto
    loadMedia({ refreshing: true });
  };

  const manualReload = () => {
    setSelected([]);
    loadMedia({ refreshing: true });
  };

  return (
    <div className="gallery-screen">
      {/* Overlay sutil de atualização */}
      {(isRefreshing && !initialLoading) && (
        <div className="refresh-overlay" aria-hidden>
          <div className="spinner" />
          <span>Atualizando…</span>
        </div>
      )}

      {/* Botão engrenagem */}
      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          zIndex: 9999,
          backgroundColor: "lime",
          padding: "6px",
          borderRadius: "6px",
        }}
      >
        <button
          onClick={() => setShowSettings((prev) => !prev)}
          style={{
            fontSize: "24px",
            backgroundColor: "white",
            color: "black",
            border: "2px solid red",
            borderRadius: "6px",
            padding: "4px 12px",
            cursor: "pointer",
          }}
        >
          ⚙️
        </button>
      </div>

      {/* Painel de configurações */}
      {showSettings && <LeadSettings config={leadConfig} setConfig={setLeadConfig} />}

      {/* Tipo de mídia + recarregar */}
      <div className="media-controls">
        <div className="media-type-selector">
          <label>
            <span style={{ marginRight: "0.5rem" }}>⚙️ Tipo:</span>
            <select
              value={mediaType}
              onChange={(e) => handleChangeMediaType(e.target.value as "image" | "video")}
            >
              <option value="image">Imagens</option>
              <option value="video">Vídeos</option>
            </select>
          </label>
        </div>

        <button className="reload-btn" onClick={manualReload}>
          🔄 Recarregar
        </button>
      </div>

      {/* Conteúdo */}
      {initialLoading ? (
        <p className="text-center text-white">Carregando…</p>
      ) : mediaItems.length === 0 ? (
        <p className="text-center text-white">
          Nenhum {mediaType === "video" ? "vídeo" : "imagem"} disponível.
        </p>
      ) : (
        <div className={`image-grid ${isRefreshing ? "is-refreshing" : ""}`}>
          {mediaItems.map((item) => {
            const isSelected = selected.includes(item.nome);
            return (
              <label
                className={`image-container ${isSelected ? "selected" : ""}`}
                key={item.id ?? item.nome}
                onClick={(e) => {
                  // permite clicar em qualquer área do card
                  if ((e.target as HTMLElement).tagName !== "INPUT") {
                    handleSelect(item.nome);
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleSelect(item.nome)}
                  className="select-checkbox"
                />
                <div className="foto-wrapper">
                  {mediaType === "image" ? (
                    <img
                      src={item.url}
                      alt={`Imagem ${item.nome}`}
                      className="image-item"
                      loading="lazy"
                      onError={(e) => {
                        console.warn("⚠️ Erro ao carregar imagem:", item.url);
                        setTimeout(() => {
                          (e.target as HTMLImageElement).src = item.url;
                        }, 2000);
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).classList.add("loaded");
                      }}
                    />
                  ) : (
                    <video
                      src={item.url}
                      controls
                      className="image-item video"
                      preload="metadata"
                    />
                  )}
                </div>
                <p className="image-name">
                  {mediaType === "video" ? "Vídeo" : "Imagem"} {item.nome}
                </p>
              </label>
            );
          })}
        </div>
      )}

      {/* Botão QRCode */}
      {selected.length > 0 && (
        <button className="generate-qr-btn" onClick={handleDownloadQRCode}>
          📅 Gerar QRCode para {selected.length} {mediaType === "video" ? "vídeo" : "imagem"}
          {selected.length > 1 ? "s" : ""}
        </button>
      )}

      {/* Modal QRCode */}
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
