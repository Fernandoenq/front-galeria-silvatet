import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const LeadSettings = ({ config, setConfig }) => {
    const handleToggle = (key) => {
        setConfig(Object.assign(Object.assign({}, config), { [key]: !config[key] }));
    };
    return (_jsxs("div", { style: {
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
        }, children: [_jsx("h3", { children: "\u2699\uFE0F Configura\u00E7\u00F5es" }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: config.capturaLead, onChange: () => handleToggle("capturaLead") }), "Ativar Captura de Lead"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: config.campoNome, onChange: () => handleToggle("campoNome") }), "Campo Nome"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: config.campoEmail, onChange: () => handleToggle("campoEmail") }), "Campo E-mail"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: config.campoTelefone, onChange: () => handleToggle("campoTelefone") }), "Campo Telefone"] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: config.campoCPF, onChange: () => handleToggle("campoCPF") }), "Campo CPF"] })] }));
};
export default LeadSettings;
