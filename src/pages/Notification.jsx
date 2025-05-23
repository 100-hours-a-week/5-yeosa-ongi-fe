const Notification = () => {
	return (
		<>
			<div className="flex flex-col min-h-screen">
				{/* 헤더 */}
				<header className="h-[52px] relative flex items-center justify-center">
					<button
						className="absolute left-4 top-1/4"
						onClick={handleBackClick}>
						<img
							className="h-1/2"
							src={Arrow_Left}
							alt="뒤로가기"
						/>
					</button>
					<h1 className="text-center">앨범 생성</h1>
				</header>
			</div>
		</>
	);
};

export default Notification;
