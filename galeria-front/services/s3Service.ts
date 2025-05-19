const API_URL = "http://localhost:8000"; // altere para o domínio da API em produção

/**
 * Busca imagens da galeria, com opção de filtrar por modo.
 * @param modo "completo" | "simples" (opcional)
 */
export async function fetchImages(modo?: "completo" | "simples"): Promise<
  {
    nome: string;
    url: string;
    modo: string;
  }[]
> {
  try {
    const url = modo
      ? `${API_URL}/images?modo=${modo}`
      : `${API_URL}/images`;

    const response = await fetch(url);
    const data = await response.json();
    return data.images;
  } catch (error) {
    console.error("Erro ao buscar imagens do S3:", error);
    return [];
  }
}

/**
 * Gera o link de download para uma imagem específica.
 * @param filename Nome do arquivo
 */
export function getDownloadLink(filename: string): string {
  return `${API_URL}/download/${encodeURIComponent(filename)}`;
}

export async function fetchZipDownloadUrl(fileNames: string[]): Promise<string | null> {
  try {
    const response = await fetch("http://localhost:8000/download-multi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fileNames),
    });

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    console.error("Erro ao gerar ZIP:", error);
    return null;
  }
}
