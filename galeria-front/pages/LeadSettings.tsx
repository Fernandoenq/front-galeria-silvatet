import React from "react";

export interface LeadConfig {
  capturaLead: boolean;
  campoNome: boolean;
  campoEmail: boolean;
  campoTelefone: boolean;
  campoCPF: boolean;
}

interface LeadSettingsProps {
  config: LeadConfig;
  setConfig: (config: LeadConfig) => void;
}

const LeadSettings: React.FC<LeadSettingsProps> = ({ config, setConfig }) => {
  const handleToggle = (key: keyof LeadConfig) => {
    setConfig({ ...config, [key]: !config[key] });
  };

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "white",
        padding: "20px",
        borderRight: "1px solid #444",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        zIndex: 1000,
        width: "220px",
      }}
    >
      <h3>⚙️ Configurações</h3>

      <label>
        <input
          type="checkbox"
          checked={config.capturaLead}
          onChange={() => handleToggle("capturaLead")}
        />
        Ativar Captura de Lead
      </label>

      <label>
        <input
          type="checkbox"
          checked={config.campoNome}
          onChange={() => handleToggle("campoNome")}
        />
        Campo Nome
      </label>

      <label>
        <input
          type="checkbox"
          checked={config.campoEmail}
          onChange={() => handleToggle("campoEmail")}
        />
        Campo E-mail
      </label>

      <label>
        <input
          type="checkbox"
          checked={config.campoTelefone}
          onChange={() => handleToggle("campoTelefone")}
        />
        Campo Telefone
      </label>

      <label>
        <input
          type="checkbox"
          checked={config.campoCPF}
          onChange={() => handleToggle("campoCPF")}
        />
        Campo CPF
      </label>
    </div>
  );
};
  
export default LeadSettings;
