// src/screens/GalleryScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
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
    for (let i = 0; i < list1.length; i++) {
      if (list1[i].nome !== list2[i].nome || list1[i].url !== list2[i].url) return false;
    }
    return true;
  };

  const busted = (url: string) => `${url}${url.includes("?") ? "&" : "?"}v=${Date.now()}`;

  const loadMedia = async (opts?: { refreshing?: boolean }) => {
    const refreshing = !!opts?.refreshing;
    try {
      if (!initialLoading && refreshing) setIsRefreshing(true);

      const result = await fetchMedia(mediaType);
      if (result.length > MAX_ITEMS) result.splice(MAX_ITEMS);

      const shouldUpdate = !areListsEqual(mediaItems, result);
      if (shouldUpdate) {
        setMediaItems(result);

        // mantém seleção apenas do que ainda existe
        const availableNames = result.map((item) => item.nome);
        const stillSelected = selected.filter((name) => availableNames.includes(name));
        if (stillSelected.length !== selected.length) setSelected(stillSelected);
      }
    } catch (error) {
      console.error("Erro ao carregar mídia:", error);
    } finally {
      if (initialLoading) setInitialLoading(false);
      if (!initialLoading && refreshing) {
        setTimeout(() => setIsRefreshing(false), 150);
      }
    }
  };

  // primeira carga única (sem polling e sem reload automático)
  useEffect(() => {
    loadMedia();
    // [] vazio -> executa apenas 1x
  }, []);

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

  const handleChangeMediaType = async (value: "image" | "video") => {
    setMediaType(value);
    setSelected([]);
    await loadMedia({ refreshing: true });
  };

  const manualReload = async () => {
    setSelected([]);
    await loadMedia({ refreshing: true });
  };

  const emptyText = useMemo(
    () => `Nenhum ${mediaType === "video" ? "vídeo" : "imagem"} disponível.`,
    [mediaType]
  );

  return (
    <div className="gallery-screen">
      {isRefreshing && !initialLoading && (
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
        <p className="text-center text-white">{emptyText}</p>
      ) : (
        <div className={`image-grid ${isRefreshing ? "is-refreshing" : ""}`}>
          {mediaItems.map((item) => {
            const isSelected = selected.includes(item.nome);
            return (
              <label
                className={`image-container ${isSelected ? "selected" : ""}`}
                key={item.id ?? item.nome}
                onClick={(e) => {
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
                        const el = e.currentTarget as HTMLImageElement;
                        if (!el.dataset.retry) {
                          el.dataset.retry = "1";
                          el.src = busted(item.url);
                        } else {
                          el.src = "/placeholder.png";
                        }
                      }}
                      onLoad={(e) => {
                        (e.currentTarget as HTMLImageElement).classList.add("loaded");
                      }}
                    />
                  ) : (
                    <video
                      src={item.url}
                      controls
                      className="image-item video"
                      preload="metadata"
                      poster="/video-poster.png"
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

      {selected.length > 0 && (
        <button className="generate-qr-btn" onClick={handleDownloadQRCode}>
          📅 Gerar QRCode para {selected.length} {mediaType === "video" ? "vídeo" : "imagem"}
          {selected.length > 1 ? "s" : ""}
        </button>
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
