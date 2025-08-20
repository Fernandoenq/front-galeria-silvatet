var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./CapturaLead.css";

const GALLERY_API_URL = import.meta.env.VITE_GALLERY_API_URL || "http://localhost:3333";

const CapturaLead = () => {
  const [form, setForm] = useState({
    nome: "",
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

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => (Object.assign(Object.assign({}, prev), { [id]: type === "checkbox" ? checked : value })));
  };

  const handleSubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();

    const { nome, email, telefone, aceitou_lgpd } = form;

    // Validações
    if (nome.trim().length < 6) {
      alert("O nome deve ter pelo menos 6 caracteres.");
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
      const response = yield fetch(`${GALLERY_API_URL}/person`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = yield response.json();
        console.log("🔥 Erro vindo do back:", errorData);
        alert("Erro ao enviar os dados. Tente novamente.");
        return;
      }

      navigate(redirect);
    } catch (err) {
      alert("Erro ao enviar os dados. Tente novamente.");
      console.error("❌ Erro ao salvar lead:", err);
    }
  });

  return (
    _jsxs("div", { className: "form-container", children: [
      _jsx("h2", { children: "Preencha para continuar" }),
      _jsxs("form", { onSubmit: handleSubmit, children: [
        _jsx("input", { type: "text", id: "nome", placeholder: "Nome completo", required: true, value: form.nome, onChange: handleChange }),
        _jsx("input", { type: "email", id: "email", placeholder: "E-mail", required: true, value: form.email, onChange: handleChange }),
        _jsx("input", { type: "tel", id: "telefone", placeholder: "Telefone", required: true, value: form.telefone, onChange: handleChange }),
        _jsxs("label", { className: "checkbox-container", children: [
          _jsx("input", { type: "checkbox", id: "aceitou_lgpd", checked: form.aceitou_lgpd, onChange: handleChange, required: true }),
          "Eu concordo com os termos da LGPD."
        ] }),
        _jsx("button", { type: "submit", children: "Prosseguir para download" })
      ] }),
      _jsx("img", { src: "/assets/logo2.png", alt: "Logo PicBrand", className: "logo" })
    ] })
  );
};

export default CapturaLead;
