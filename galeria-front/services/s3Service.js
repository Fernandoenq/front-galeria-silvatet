var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_URL = import.meta.env.VITE_GALLERY_API_URL || "http://127.0.0.1:8000";
/**
 * Busca imagens ou vídeos da galeria.
 * @param tipo "image" ou "video"
 */
export function fetchMedia() {
    return __awaiter(this, arguments, void 0, function* (tipo = "image") {
        try {
            const response = yield fetch(`${API_URL}/api/media?tipo=${tipo}`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar mídia: ${response.statusText}`);
            }
            const data = yield response.json();
            if (!data.images || !Array.isArray(data.images)) {
                throw new Error("Resposta da API não contém 'images'.");
            }
            const itensValidos = data.images
                .filter((item) => item.nome && item.url)
                .map((item, index) => {
                var _a;
                return ({
                    id: (_a = item.id) !== null && _a !== void 0 ? _a : index,
                    nome: item.nome,
                    url: item.url,
                });
            });
            return itensValidos;
        }
        catch (error) {
            console.error("❌ Erro ao buscar mídia:", error);
            return [];
        }
    });
}
/**
 * Gera link de download para um arquivo individual.
 */
export function getDownloadLink(filename) {
    return `${API_URL}/download/${encodeURIComponent(filename)}`;
}
/**
 * Gera um ZIP com múltiplos arquivos selecionados.
 */
export function fetchZipDownloadUrl(fileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_URL}/download-multi`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filenames: fileNames }),
            });
            if (!response.ok) {
                throw new Error(`Erro ao baixar ZIP: ${response.statusText}`);
            }
            const blob = yield response.blob();
            return URL.createObjectURL(blob);
        }
        catch (error) {
            console.error("❌ Erro ao gerar ZIP:", error);
            return null;
        }
    });
}
