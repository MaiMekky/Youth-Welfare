"use client";
import React, { ReactNode } from "react";
import "../Styles/model.module.css";

interface ModalProps {
  isOpen: boolean;       // shows or hides the popup
  onClose: () => void;   // closes it when user clicks outside or ×
  children: ReactNode;   // what goes inside the popup (login / signup)
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
