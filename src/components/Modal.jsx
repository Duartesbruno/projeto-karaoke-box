import { useEffect } from "react";
import closeIcon from "../assets/close-icon.png"

export default function Modal({ isOpen, onClose, children }) {
    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button type="button" className="modal-close-button" onClick={onClose}>
                <img src={closeIcon} alt='Fechar' />
                </button>
                {children}
            </div>
        </div>
    )
}