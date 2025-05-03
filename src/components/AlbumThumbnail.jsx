import { useState } from "react";
import useSelectionStore from "../stores/selectionStore";

const AlbumThumbnail = () => {
	const hasCoworkers = false;
	const [selected, setSelected] = useState(false);
	const handleSelect = () => {
		console.log("click");
		setSelected(true);
		selectItem(id);
	};
	const { selectedId, selectItem } = useSelectionStore();
	return (
		<div
			className="relative w-full h-full border border-solid"
			onClick={handleSelect}>
			<img
				className="object-cover w-full h-full"
				src="public/default-featured-image.jpg"
				alt="Album thumbnail"
			/>
			{selected && (
				<div className="absolute inset-0 z-10 bg-black opacity-20"></div>
			)}
			{hasCoworkers ? `<Coworker>` : ""}
		</div>
	);
};
export default AlbumThumbnail;
