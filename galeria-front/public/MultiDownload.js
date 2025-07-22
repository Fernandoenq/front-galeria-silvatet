import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import "./MultiDownload.css";
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET_NAME;
const AWS_REGION = import.meta.env.VITE_AWS_REGION;
const MultiDownload = () => {
    const [files, setFiles] = useState([]);
    useEffect(() => {
        var _a;
        const params = new URLSearchParams(window.location.search);
        const nomes = ((_a = params.get("imagens")) === null || _a === void 0 ? void 0 : _a.split(",")) || [];
        const decoded = nomes
            .map((nome) => decodeURIComponent(nome.trim()))
            .filter((n) => n !== "");
        const fileData = decoded.map((nome) => {
            var _a;
            const extension = (_a = nome.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            let tipo = "unknown";
            if (extension) {
                if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
                    tipo = "image";
                }
                else if (["mp4", "webm", "ogg"].includes(extension)) {
                    tipo = "video";
                }
            }
            return {
                nome,
                url: `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${nome}`,
                tipo,
            };
        });
        setFiles(fileData);
    }, []);
    if (files.length === 0) {
        return (_jsxs("div", { className: "multi-container", children: [_jsx("h2", { children: "Nenhum arquivo selecionado." }), _jsx("p", { children: "Certifique-se de acessar este link corretamente pelo QR Code." })] }));
    }
    return (_jsxs("div", { className: "multi-container", children: [_jsx("h1", { children: "Arquivos para Download" }), _jsx("div", { className: "multi-grid", children: files.map((file, idx) => (_jsxs("div", { className: "img-block", children: [file.tipo === "image" && (_jsx("img", { src: file.url, alt: `imagem-${idx + 1}`, onError: (e) => {
                                console.error("❌ Erro ao carregar imagem:", file.url);
                                e.target.src =
                                    "https://placehold.co/300x400?text=Erro+na+imagem";
                            } })), file.tipo === "video" && (_jsxs("video", { controls: true, width: "300", children: [_jsx("source", { src: file.url }), "Seu navegador n\u00E3o suporta v\u00EDdeo."] })), file.tipo === "unknown" && (_jsxs("p", { children: ["Arquivo n\u00E3o suportado: ", file.nome] })), _jsxs("a", { className: "btn", href: file.url, download: file.nome, children: ["\u2B07\uFE0F Baixar ", file.tipo === "image" ? "imagem" : file.tipo === "video" ? "vídeo" : "arquivo"] })] }, idx))) })] }));
};
export default MultiDownload;
