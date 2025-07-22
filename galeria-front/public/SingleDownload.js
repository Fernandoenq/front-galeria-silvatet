import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import "./SingleDownload.css";
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET_NAME;
const AWS_REGION = import.meta.env.VITE_AWS_REGION;
const SingleDownload = () => {
    const [fileUrl, setFileUrl] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [fileType, setFileType] = useState(null);
    useEffect(() => {
        var _a;
        const params = new URLSearchParams(window.location.search);
        const nomeParam = params.get("imagens");
        if (nomeParam) {
            const nomes = nomeParam
                .split(",")
                .map((n) => decodeURIComponent(n.trim()))
                .filter((n) => n !== "");
            if (nomes.length > 0) {
                const name = nomes[0]; // Usa apenas a primeira
                setFileName(name);
                const fullUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${name}`;
                setFileUrl(fullUrl);
                // Detectar tipo de arquivo pela extensão
                const extension = (_a = name.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                if (extension) {
                    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
                        setFileType("image");
                    }
                    else if (["mp4", "webm", "ogg"].includes(extension)) {
                        setFileType("video");
                    }
                    else {
                        setFileType(null);
                    }
                }
            }
        }
    }, []);
    if (!fileUrl || !fileName || !fileType) {
        return (_jsxs("div", { className: "multi-container", children: [_jsx("h2", { children: "Nenhum arquivo encontrado." }), _jsx("p", { children: "Verifique se o link est\u00E1 correto ou se o formato \u00E9 suportado." })] }));
    }
    return (_jsxs("div", { className: "multi-container", children: [_jsx("h1", { children: "Download do Arquivo" }), _jsxs("div", { className: "img-block", children: [fileType === "image" && (_jsx("img", { src: fileUrl, alt: "imagem", onError: (e) => {
                            console.error("❌ Erro ao carregar imagem:", fileUrl);
                            e.target.src =
                                "https://placehold.co/300x400?text=Erro+na+imagem";
                        } })), fileType === "video" && (_jsxs("video", { controls: true, width: "300", children: [_jsx("source", { src: fileUrl }), "Seu navegador n\u00E3o suporta v\u00EDdeo."] })), _jsxs("a", { className: "btn", href: fileUrl, download: fileName, children: ["\u2B07\uFE0F Baixar ", fileType === "image" ? "imagem" : "vídeo"] })] })] }));
};
export default SingleDownload;
