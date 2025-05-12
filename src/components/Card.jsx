import { useState } from "react";
import useCollectionStore from "../stores/collectionStore";

const Card = () => {
	const [isFlipped, setIsFlipped] = useState(false);
	const { allCollection } = useCollectionStore();

	const handleClick = () => {
		setIsFlipped(!isFlipped);
	};

	return (
		<div className="m-4" style={{ perspective: "1000px" }}>
			<div
				className={`rounded-3xl h-[300px] shadow-lg cursor-pointer transition-all duration-500`}
				style={{
					transformStyle: "preserve-3d",
					transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
				}}
				onClick={handleClick}>
				{/* 카드 앞면 */}
				<div
					className="absolute w-full h-full p-5 rounded-3xl bg-gray-light"
					style={{
						backfaceVisibility: "hidden",
						transform: "rotateY(0deg)",
					}}>
					<div className="flex flex-col items-center justify-center h-full">
						<img src={allCollection.pictures[0].pictureURL}></img>
						<h3 className="text-xl font-bold text-black-light">
							Card 앞면
						</h3>
					</div>
				</div>

				{/* 카드 뒷면 */}
				<div
					className="absolute w-full h-full p-5 rounded-3xl bg-primary"
					style={{
						backfaceVisibility: "hidden",
						transform: "rotateY(180deg)",
						top: 0,
						left: 0,
					}}>
					<div className="flex flex-col items-center justify-center h-full">
						<h3 className="text-xl font-bold text-black-light">
							Card 뒷면
						</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Card;
