export interface ImageItem {
  id: number;
  nome: string;
  url: string;
}

const API_URL =
  import.meta.env.VITE_GALLERY_API_URL || "http://127.0.0.1:8000";

/**
 * Busca imagens ou vídeos da galeria.
 * @param tipo "image" ou "video"
 */
export async function fetchMedia(tipo: "image" | "video" = "image"): Promise<ImageItem[]> {
  try {
    const response = await fetch(`${API_URL}/api/media?tipo=${tipo}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar mídia: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.images || !Array.isArray(data.images)) {
      throw new Error("Resposta da API não contém 'images'.");
    }

    const itensValidos: ImageItem[] = data.images
      .filter((item: any) => item.nome && item.url)
      .map((item: any, index: number) => ({
        id: item.id ?? index,
        nome: item.nome,
        url: item.url,
      }));

    return itensValidos;
  } catch (error) {
    console.error("❌ Erro ao buscar mídia:", error);
    return [];
  }
}

/**
 * Gera link de download para um arquivo individual.
 */
export function getDownloadLink(filename: string): string {
  return `${API_URL}/download/${encodeURIComponent(filename)}`;
}

/**
 * Gera um ZIP com múltiplos arquivos selecionados.
 */
export async function fetchZipDownloadUrl(
  fileNames: string[]
): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/download-multi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filenames: fileNames }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao baixar ZIP: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("❌ Erro ao gerar ZIP:", error);
    return null;
  }
}
