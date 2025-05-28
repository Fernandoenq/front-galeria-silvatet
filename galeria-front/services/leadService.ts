export interface Lead {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  aceitou_lgpd: boolean;
}

const API_URL = "http://ec2-15-228-154-153.sa-east-1.compute.amazonaws.com:3334";

/**
 * Envia os dados do lead para o backend via POST.
 * @param lead Objeto com os dados do lead
 * @throws Erro se o backend retornar status diferente de 200
 */
export async function enviarLead(lead: Lead): Promise<void> {
  const response = await fetch(`${API_URL}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao salvar lead: ${text}`);
  }
}
