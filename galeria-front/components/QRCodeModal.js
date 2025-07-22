var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import "./QRCodeModal.css";
const GALLERY_API_URL = import.meta.env.VITE_GALLERY_API_URL || "http://localhost:3333";
const BASE_URL = import.meta.env.VITE_PUBLIC_HOST || window.location.origin;
const QRCodeModal = ({ imageUrl, onClose, multipleImages, }) => {
    const [previewUrl, setPreviewUrl] = useState(imageUrl);
    const [qrUrl, setQrUrl] = useState("");
    const [orientacao, setOrientacao] = useState("portrait");
    const [printList, setPrintList] = useState([]);
    const [isVideo, setIsVideo] = useState(false);
    useEffect(() => {
        var _a;
        setQrUrl("");
        setPrintList([]);
        setIsVideo(false);
        const nomeArquivo = (multipleImages === null || multipleImages === void 0 ? void 0 : multipleImages[0]) || imageUrl;
        const extensao = (_a = nomeArquivo.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (extensao === "mp4") {
            setIsVideo(true);
        }
        if (multipleImages === null || multipleImages === void 0 ? void 0 : multipleImages.length) {
            setPreviewUrl(multipleImages[0]);
            prepararMultiplas(multipleImages);
        }
        else {
            prepararUnica(imageUrl);
        }
    }, [imageUrl, multipleImages]);
    const prepararMultiplas = (urls) => {
        const generatedList = urls.map((url) => ({
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
    const prepararUnica = (url) => {
        const nome = extrairNomeArquivo(url);
        setPreviewUrl(url);
        setPrintList([{ nome, url, quantidade: 1 }]);
        const redirectUrl = `/download?imagens=${encodeURIComponent(nome)}`;
        const fullUrl = `${BASE_URL}/captura-lead?redirect=${encodeURIComponent(redirectUrl)}`;
        setQrUrl(fullUrl);
    };
    const extrairNomeArquivo = (url) => {
        const partes = url.split("/");
        return partes[partes.length - 1].split("?")[0];
    };
    const enviarParaImpressao = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const body = printList.map(({ nome, quantidade }) => ({ nome, quantidade }));
            const response = yield fetch(`${GALLERY_API_URL}/marcar-para-impressao`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!response.ok)
                throw new Error("Erro na requisição");
            alert("✅ Imagens enviadas para impressão");
        }
        catch (err) {
            console.error("❌ Erro ao marcar imagem para impressão:", err);
            alert("❌ Erro ao enviar para impressão");
        }
    });
    const updateQuantity = (index, value) => {
        setPrintList((prev) => {
            const updated = [...prev];
            updated[index].quantidade = value;
            return updated;
        });
    };
    return (_jsx("div", { className: "qr-modal-overlay", onClick: onClose, children: _jsxs("div", { className: "qr-modal-content", onClick: (e) => e.stopPropagation(), children: [!(multipleImages === null || multipleImages === void 0 ? void 0 : multipleImages.length) && (_jsxs(_Fragment, { children: [_jsx("div", { className: "foto-wrapper", children: isVideo ? (_jsx("video", { src: previewUrl, controls: true, style: { width: "100%", borderRadius: "8px" } })) : (_jsx("img", { src: previewUrl, alt: "Imagem final", className: "qr-modal-image", onError: (e) => {
                                    console.error("❌ Erro ao carregar preview:", previewUrl);
                                    e.target.src =
                                        "https://placehold.co/300x400?text=Erro+na+imagem";
                                } })) }), !isVideo && (_jsxs("button", { style: { margin: "16px auto", padding: "8px 16px" }, onClick: () => setOrientacao((prev) => prev === "portrait" ? "landscape" : "portrait"), children: ["Modo: ", orientacao === "portrait" ? "Retrato (9:16)" : "Paisagem (16:9)"] }))] })), qrUrl && (_jsxs(_Fragment, { children: [_jsx("p", { className: "qr-modal-text", children: "Escaneie para baixar" }), _jsx("div", { className: "qr-code-wrapper", children: _jsx(QRCode, { value: qrUrl, size: 180 }) })] })), !isVideo && printList.length > 0 && (_jsxs("div", { className: "qr-carousel-container", children: [_jsx("h3", { className: "qr-carousel-title", children: "Imagens selecionadas" }), _jsx("div", { className: "qr-carousel-scroll", children: printList.map((item, idx) => (_jsxs("div", { className: "qr-carousel-card", children: [_jsx("img", { src: item.url, alt: `preview-${idx}`, className: "qr-carousel-image", onError: (e) => {
                                            console.error(`❌ Erro ao carregar miniatura ${item.url}`);
                                            e.target.src =
                                                "https://placehold.co/150x200?text=Erro";
                                        } }), _jsxs("div", { className: "qr-carousel-controls", children: [_jsx("label", { htmlFor: `qtd-${idx}`, children: "Quantidade:" }), _jsx("input", { id: `qtd-${idx}`, type: "number", min: "1", value: item.quantidade, onChange: (e) => {
                                                    const value = Math.max(1, parseInt(e.target.value) || 1);
                                                    updateQuantity(idx, value);
                                                } })] })] }, idx))) }), _jsx("button", { className: "qr-print-button", onClick: enviarParaImpressao, children: "Enviar para Impress\u00E3o" })] })), _jsx("button", { className: "qr-modal-close", onClick: onClose, children: "Fechar" })] }) }));
};
export default QRCodeModal;
