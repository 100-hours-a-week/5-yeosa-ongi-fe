const ConfirmModal = ({ title, content, closeModal, handleConfirm }) => {
	return (
		<div className="w-full max-w-md mx-auto overflow-hidden transition-all transform bg-white rounded-lg shadow-xl dark:bg-gray-800">
			<div className="items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
				<h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
					{title}
				</h2>
				{Array.isArray(content) ? (
					content.map((line, index) => <div key={index}>{line}</div>)
				) : (
					<div>{content}</div>
				)}

				<div className="flex justify-center gap-16 mt-8">
					<button
						className="w-20 border rounded-lg h-7"
						onClick={() => {
							closeModal();
						}}>
						아니오
					</button>
					<button
						className="w-20 border rounded-lg h-7"
						onClick={() => {
							handleConfirm();
							closeModal();
						}}>
						예
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
