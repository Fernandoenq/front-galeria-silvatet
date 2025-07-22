var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { fetchMedia } from "../services/s3Service";
import QRCodeModal from "../components/QRCodeModal";
import "./GalleryScreen.css";
const MAX_ITEMS = 30;
const GalleryScreen = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [selected, setSelected] = useState([]);
    const [selectedImageUrl, setSelectedImageUrl] = useState(null);
    const [multipleImagesUrls, setMultipleImagesUrls] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mediaType, setMediaType] = useState("image");
    const areListsEqual = (list1, list2) => {
        if (list1.length !== list2.length)
            return false;
        return list1.every((item, idx) => item.nome === list2[idx].nome && item.url === list2[idx].url);
    };
    const loadMedia = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const result = yield fetchMedia(mediaType);
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
        }
        catch (error) {
            console.error("Erro ao carregar mídia:", error);
        }
    });
    useEffect(() => {
        let isMounted = true;
        const watchMedia = () => __awaiter(void 0, void 0, void 0, function* () {
            while (isMounted) {
                if (selected.length === 0) {
                    yield loadMedia();
                }
                yield new Promise((resolve) => setTimeout(resolve, 3000));
            }
        });
        setLoading(true);
        loadMedia().then(() => {
            setLoading(false);
            watchMedia();
        });
        return () => {
            isMounted = false;
        };
    }, [selected, mediaType]);
    const handleSelect = (filename) => {
        setSelected((prev) => prev.includes(filename)
            ? prev.filter((name) => name !== filename)
            : [...prev, filename]);
    };
    const handleDownloadQRCode = () => {
        if (selected.length === 1) {
            const item = mediaItems.find((i) => i.nome === selected[0]);
            if (item) {
                setSelectedImageUrl(item.url);
                setMultipleImagesUrls(null);
            }
        }
        else if (selected.length > 1) {
            const selectedUrls = mediaItems
                .filter((i) => selected.includes(i.nome))
                .map((i) => i.url);
            setMultipleImagesUrls(selectedUrls);
            setSelectedImageUrl(null);
        }
    };
    return (_jsxs("div", { className: "gallery-screen", children: [_jsx("div", { className: "media-type-selector", children: _jsxs("label", { children: [_jsx("span", { style: { marginRight: "0.5rem" }, children: "\u2699\uFE0F Tipo:" }), _jsxs("select", { value: mediaType, onChange: (e) => {
                                setMediaType(e.target.value);
                                setSelected([]);
                                setLoading(true);
                                loadMedia().then(() => setLoading(false));
                            }, children: [_jsx("option", { value: "image", children: "Imagens" }), _jsx("option", { value: "video", children: "V\u00EDdeos" })] })] }) }), selected.length > 0 && (_jsxs("button", { className: "generate-qr-btn", onClick: handleDownloadQRCode, children: ["\uD83D\uDCC5 Gerar QRCode para ", selected.length, " ", mediaType === "video" ? "vídeo" : "imagem", selected.length > 1 ? "s" : ""] })), loading ? (_jsxs("p", { className: "text-center text-white", children: ["Carregando ", mediaType === "video" ? "vídeos" : "imagens", "..."] })) : mediaItems.length === 0 ? (_jsxs("p", { className: "text-center text-white", children: ["Nenhum ", mediaType === "video" ? "vídeo" : "imagem", " dispon\u00EDvel."] })) : (_jsx("div", { className: "image-grid", children: mediaItems.map((item) => {
                    var _a;
                    const isSelected = selected.includes(item.nome);
                    return (_jsxs("label", { className: `image-container ${isSelected ? "selected" : ""}`, children: [_jsx("input", { type: "checkbox", checked: isSelected, onChange: () => handleSelect(item.nome), className: "select-checkbox" }), _jsx("div", { className: "foto-wrapper", children: mediaType === "image" ? (_jsx("img", { src: item.url, alt: `Imagem ${item.nome}`, className: "image-item", loading: "lazy", onError: (e) => {
                                        console.warn("⚠️ Erro ao carregar imagem:", item.url);
                                        setTimeout(() => {
                                            e.target.src = item.url;
                                        }, 2000);
                                    }, onLoad: () => {
                                        console.log("✅ Imagem carregada:", item.url);
                                    } })) : (_jsx("video", { src: item.url, controls: true, className: "image-item", preload: "metadata" })) }), _jsxs("p", { className: "image-name", children: [mediaType === "video" ? "Vídeo" : "Imagem", " ", item.nome] })] }, (_a = item.id) !== null && _a !== void 0 ? _a : item.nome));
                }) })), (selectedImageUrl || multipleImagesUrls) && (_jsx(QRCodeModal, { imageUrl: selectedImageUrl || "", multipleImages: multipleImagesUrls || undefined, onClose: () => {
                    setSelectedImageUrl(null);
                    setMultipleImagesUrls(null);
                } }))] }));
};
export default GalleryScreen;
