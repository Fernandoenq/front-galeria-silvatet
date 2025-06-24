export interface ImageItem {
  id: number;
  nome: string;
  url: string;
}

// Usa a variável de ambiente ou localhost como fallback
const API_URL =
  import.meta.env.VITE_GALLERY_API_URL || "http://127.0.0.1:8000";

/**
 * Busca todas as imagens da galeria.
 */
export async function fetchImages(): Promise<ImageItem[]> {
  try {
    const response = await fetch(`${API_URL}/images`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar imagens: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.images || !Array.isArray(data.images)) {
      throw new Error("Resposta da API não contém 'images'.");
    }

    // Verifica e mapeia as imagens válidas
    const imagensValidas: ImageItem[] = data.images
      .filter((img: any) => img.nome && img.url)
      .map((img: any, index: number) => ({
        id: img.id ?? index,
        nome: img.nome,
        url: img.url,
      }));

    return imagensValidas;
  } catch (error) {
    console.error("❌ Erro ao buscar imagens:", error);
    return [];
  }
}

/**
 * Gera link de download para uma imagem individual.
 */
export function getDownloadLink(filename: string): string {
  return `${API_URL}/download/${encodeURIComponent(filename)}`;
}

/**
 * Gera um ZIP com múltiplas imagens selecionadas.
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
