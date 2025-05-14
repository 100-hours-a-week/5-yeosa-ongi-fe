import KakaoMap from "@/components/common/Map";
import useCollectionStore from "@/stores/collectionStore";
import { useState } from "react";

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
					className="absolute w-full h-full p-5 "
					style={{
						backfaceVisibility: "hidden",
						transform: "rotateY(0deg)",
					}}>
					<div className="flex flex-col items-center justify-center h-full">
						<img
							className="absolute inset-0 object-cover w-full h-full rounded-3xl"
							src={allCollection.pictures[0].pictureURL}></img>
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
					<div className="absolute inset-0 object-cover w-full h-full rounded-3xl">
						<KakaoMap />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Card;
