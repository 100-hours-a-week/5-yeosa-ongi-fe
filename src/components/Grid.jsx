import AlbumThumbnail from "./AlbumThumbnail";

const Grid = ({ col = 4, items = [], ElementType = AlbumThumbnail }) => {
	const mockItems = [1, 2, 3, 4, 5, 6, 7];

	const chunkArrayByCol = (array, chunkSize) => {
		return Array(Math.ceil(array.length / chunkSize))
			.fill()
			.map((_, index) => {
				// For each placeholder, return a slice of the original array
				const start = index * chunkSize;
				return array.slice(start, start + chunkSize);
			});
	};
	const chunkArray = chunkArrayByCol(mockItems, col);
	return (
		<>
			{chunkArray.map((array, index) => (
				<div
					className={`grid grid-cols-4`}
					style={{ height: `calc(100vw / ${col})` }}>
					{array.map((items, index) => (
						<div className="border-[1px] border-solid">
							<ElementType>{items}</ElementType>
						</div>
					))}
				</div>
			))}
		</>
	);
};

export default Grid;
