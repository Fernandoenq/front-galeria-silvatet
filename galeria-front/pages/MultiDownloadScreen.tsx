import React, { useEffect } from "react";

const API_URL = "http://ec2-15-228-154-153.sa-east-1.compute.amazonaws.com:3334";

const MultiDownloadScreen: React.FC = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nomes = params.get("imagens")?.split(",") || [];
    const container = document.getElementById("imagens");

    nomes.forEach((nome, index) => {
      const decodedNome = decodeURIComponent(nome.trim());
      const url = `${API_URL}/uploaded/${decodedNome}`;
      const block = document.createElement("div");
      block.className = "img-block";
      block.innerHTML = `
        <img src="${url}" alt="imagem-${index + 1}" />
        <a class="btn" href="${url}" download="imagem-${index + 1}.png">
          ⬇️ Baixar imagem ${index + 1}
        </a>
      `;
      container?.appendChild(block);
    });
  }, []);

  return (
    <div className="container" style={containerStyle}>
      <h1 style={h1Style}>Imagens para Download</h1>
      <div id="imagens"></div>
    </div>
  );
};

export default MultiDownloadScreen;

// Inline styles (para manter o visual original sem CSS externo)
const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "40px auto",
  background: "white",
  padding: "24px",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
};

const h1Style: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "32px",
};
