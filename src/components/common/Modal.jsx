import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Modal({ isOpen, onClose, title, children }) {
	const [modalRoot, setModalRoot] = useState(null);

	useEffect(() => {
		setModalRoot(document.getElementById("modal-root"));
	}, []);

	if (!isOpen || !modalRoot) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
			onClick={onClose}>
			<div
				className="relative w-full max-w-md mx-auto overflow-hidden transition-all transform bg-white rounded-lg shadow-xl dark:bg-gray-800"
				onClick={(e) => e.stopPropagation()}>
				<div className="absolute right-0 z-20 p-4 ">
					<button
						className="p-1 text-gray-500 transition-colors rounded-full hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
						onClick={onClose}>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div className="text-gray-700 dark:text-gray-300">
					{children}
				</div>
			</div>
		</div>,
		modalRoot
	);
}
