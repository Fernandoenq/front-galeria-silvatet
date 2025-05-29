import React, { useState, useEffect } from "react";

const API_URL = "http://ec2-15-228-154-153.sa-east-1.compute.amazonaws.com:3334";

const CapturaLeadScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
    aceitou_lgpd: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erro ao salvar lead.");

      const params = new URLSearchParams(document.location.href.split("?")[1]);

      const redirect = localStorage.getItem("redirect_url");

      if (redirect) {
        window.location.href = redirect;
      } else {
        alert("Cadastro realizado, mas a URL de redirecionamento não foi definida.");
      }
    } catch (err) {
      alert("Erro ao enviar os dados. Tente novamente.");
      console.error("Erro ao salvar lead:", err);
    }
  };
const bodyStyle: React.CSSProperties = {
  margin: 0,
  padding: "20px",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#000",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  color: "#fff",
  boxSizing: "border-box", // ← garante que padding seja considerado no layout
};

const formContainerStyle: React.CSSProperties = {
  backgroundColor: "#111",
  padding: "40px 24px", // ← ajustado para margem mais segura em mobile
  borderRadius: "15px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 0 20px rgba(255, 255, 255, 0.08)",
  textAlign: "center",
};

const h2Style: React.CSSProperties = {
  marginBottom: "24px",
  fontSize: "1.6rem",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  backgroundColor: "#222",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "15px",
  boxSizing: "border-box", // 👈 ESSENCIAL
};


const checkboxContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  fontSize: "13px",
  color: "#ccc",
  marginTop: "10px",
  marginBottom: "20px",
  gap: "8px",
  textAlign: "left",
};

const checkboxStyle: React.CSSProperties = {
  width: "16px",
  height: "16px",
  border: "2px solid #fff",
  borderRadius: "50%",
  outline: "none",
  cursor: "pointer",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#1e90ff",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer",
};

const logoStyle: React.CSSProperties = {
  marginTop: "25px",
  width: "120px",
  opacity: 0.8,
};

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (redirect) {
    localStorage.setItem("redirect_url", redirect);
  }
}, []);

  return (
    <div style={bodyStyle}>
      <div style={formContainerStyle}>
        <h2 style={h2Style}>Preencha para continuar</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" id="nome" placeholder="Nome completo" required value={formData.nome} onChange={handleChange} style={inputStyle} />
          <input type="text" id="cpf" placeholder="CPF" required value={formData.cpf} onChange={handleChange} style={inputStyle} />
          <input type="email" id="email" placeholder="E-mail" required value={formData.email} onChange={handleChange} style={inputStyle} />
          <input type="tel" id="telefone" placeholder="Telefone" required value={formData.telefone} onChange={handleChange} style={inputStyle} />

          <label style={checkboxContainerStyle}>
            <input type="checkbox" id="aceitou_lgpd" required checked={formData.aceitou_lgpd} onChange={handleChange} style={checkboxStyle} />
            Eu concordo com os termos da LGPD.
          </label>

          <button type="submit" style={buttonStyle}>Prosseguir para download</button>
        </form>

        <img src="/assets/logo2.png" alt="Logo PicBrand" style={logoStyle} />
      </div>
    </div>
  );
};

export default CapturaLeadScreen;
