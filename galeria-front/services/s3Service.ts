const API_URL = "http://localhost:8000"; // Altere para seu domínio em produção

/**
 * Busca todas as imagens da galeria.
 * Retorna: [{ nome: string, url: string }]
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

    // Garantir estrutura esperada
    if (!data.images || !Array.isArray(data.images)) {
      throw new Error("Resposta da API não contém 'images'.");
    }

    return data.images;
  } catch (error) {
    console.error("Erro ao buscar imagens:", error);
    return [];
  }
}

/**
 * Gera o link de download direto para uma imagem individual.
 * OBS: necessário implementar /download/{filename} no backend.
 */
export function getDownloadLink(filename: string): string {
  return `${API_URL}/download/${encodeURIComponent(filename)}`;
}

/**
 * Requisita o download de múltiplas imagens como arquivo ZIP.
 * A API espera um JSON: { "filenames": ["img1.jpg", "img2.jpg"] }
 */
export async function fetchZipDownloadUrl(fileNames: string[]): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/download-multi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filenames: fileNames }),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição do ZIP: ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Erro ao gerar ZIP:", error);
    return null;
  }
}
