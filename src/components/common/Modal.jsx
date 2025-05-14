import { createPortal } from "react-dom";

export function Modal({ isOpen, onClose, title, children }) {
	if (!isOpen) return null;

	return createPortal(
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-container"
				onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>{title}</h2>
					<button className="close-button" onClick={onClose}>
						×
					</button>
				</div>
				<div className="modal-content">{children}</div>
			</div>
		</div>,
		document.getElementById("modal-root")
	);
}
