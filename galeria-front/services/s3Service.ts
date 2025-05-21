const API_URL = "http://localhost:8000"; // Em produção, troque para seu domínio

/**
 * Busca todas as imagens da galeria.
 */
export async function fetchImages(): Promise<
  {
    nome: string;
    url: string;
  }[]
> {
  try {
    const response = await fetch(`${API_URL}/images`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar imagens: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.images || !Array.isArray(data.images)) {
      throw new Error("Resposta da API não contém 'images'.");
    }

    return data.images;
  } catch (error) {
    console.error("❌ Erro ao buscar imagens:", error);
    return [];
  }
}

/**
 * Gera link de download para uma imagem individual.
 * (OBS: /download/{filename} precisa estar implementado no backend)
 */
export function getDownloadLink(filename: string): string {
  return `${API_URL}/download/${encodeURIComponent(filename)}`;
}

/**
 * Gera um ZIP com múltiplas imagens selecionadas.
 */
export async function fetchZipDownloadUrl(fileNames: string[]): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/download-multi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filenames: fileNames, // Isso precisa ser exatamente igual ao modelo `FileList` do backend
      }),
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
