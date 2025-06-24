export interface Lead {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  aceitou_lgpd: boolean;
}

// ✅ Usa variável de ambiente se houver, senão usa localhost
const API_URL =
  import.meta.env.VITE_GALLERY_API_URL || "http://127.0.0.1:8000";

/**
 * Envia os dados do lead para o backend via POST.
 * @param lead Objeto com os dados do lead
 * @throws Erro se o backend retornar status diferente de 200
 */
export async function enviarLead(lead: Lead): Promise<void> {
  const response = await fetch(`${API_URL}/person`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao salvar lead: ${text}`);
  }
}
