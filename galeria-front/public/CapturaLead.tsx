import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./CapturaLead.css";

const GALLERY_API_URL =
  import.meta.env.VITE_GALLERY_API_URL || "http://localhost:3333";

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
    try {
      const response = await fetch(`${GALLERY_API_URL}/person`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Erro ao salvar lead.");

      navigate(redirect);
    } catch (err) {
      alert("Erro ao enviar os dados. Tente novamente.");
      console.error("❌ Erro ao salvar lead:", err);
    }
  };

  const handlePular = () => {
    navigate(redirect);
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

      <button onClick={handlePular} style={{ marginTop: "10px" }}>
        Pular
      </button>

      <img src="/assets/logo2.png" alt="Logo PicBrand" className="logo" />
    </div>
  );
};

export default CapturaLead;
