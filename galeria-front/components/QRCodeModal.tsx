import React from "react";
import QRCode from "react-qr-code";
import "./QRCodeModal.css";

interface QRCodeModalProps {
  imageUrl: string;      // Exibição da imagem
  qrCodeLink: string;    // Link de download no QR Code
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ imageUrl, qrCodeLink, onClose }) => {
  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Imagem ampliada" className="qr-modal-image" />
        <p className="qr-modal-text">Escaneie para baixar</p>
        <QRCode value={qrCodeLink} size={180} />
        <button className="qr-modal-close" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default QRCodeModal;
