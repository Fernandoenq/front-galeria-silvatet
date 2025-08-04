import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./CapturaLead.css";

const GALLERY_API_URL =
  import.meta.env.VITE_GALLERY_API_URL || "http://localhost:3333";

// ✅ Validação real de CPF com dígitos verificadores
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += +cpf.charAt(i) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== +cpf.charAt(9)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += +cpf.charAt(i) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === +cpf.charAt(10);
}

const CapturaLead: React.FC = () => {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    aceitou_lgpd: false,
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [redirect, setRedirect] = useState("/");

  useEffect(() => {
    const redir = searchParams.get("redirect");
    if (redir) setRedirect(redir);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { nome, cpf, email, telefone, aceitou_lgpd } = form;

    // Validações
    if (nome.trim().length < 6) {
      alert("O nome deve ter pelo menos 6 caracteres.");
      return;
    }

    const onlyDigitsCPF = cpf.replace(/\D/g, "");
    if (!validarCPF(onlyDigitsCPF)) {
      alert("CPF inválido.");
      return;
    }

    const onlyDigitsPhone = telefone.replace(/\D/g, "");
    if (onlyDigitsPhone.length !== 11) {
      alert("O telefone deve conter exatamente 11 dígitos numéricos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Digite um e-mail válido.");
      return;
    }

    if (!aceitou_lgpd) {
      alert("É necessário aceitar os termos da LGPD.");
      return;
    }

    // Envio dos dados
    try {
      const response = await fetch(`${GALLERY_API_URL}/person`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("🔥 Erro vindo do back:", errorData);

        if (
          response.status === 400 &&
          errorData.detail?.includes("CPF já foi utilizado")
        ) {
          alert("⚠️ Este CPF já foi utilizado hoje.");
        } else {
          alert("Erro ao enviar os dados. Tente novamente.");
        }

        return;
      }

      navigate(redirect);
    } catch (err) {
      alert("Erro ao enviar os dados. Tente novamente.");
      console.error("❌ Erro ao salvar lead:", err);
    }
  };

  return (
    <div className="form-container">
      <h2>Preencha para continuar</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="nome"
          placeholder="Nome completo"
          required
          value={form.nome}
          onChange={handleChange}
        />
        <input
          type="text"
          id="cpf"
          placeholder="CPF"
          required
          value={form.cpf}
          onChange={handleChange}
        />
        <input
          type="email"
          id="email"
          placeholder="E-mail"
          required
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="tel"
          id="telefone"
          placeholder="Telefone"
          required
          value={form.telefone}
          onChange={handleChange}
        />
        <label className="checkbox-container">
          <input
            type="checkbox"
            id="aceitou_lgpd"
            checked={form.aceitou_lgpd}
            onChange={handleChange}
            required
          />
          Eu concordo com os termos da LGPD.
        </label>
        <button type="submit">Prosseguir para download</button>
      </form>
      <img src="/assets/logo2.png" alt="Logo PicBrand" className="logo" />
    </div>
  );
};

export default CapturaLead;
