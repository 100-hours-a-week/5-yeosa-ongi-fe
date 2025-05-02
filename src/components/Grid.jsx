const Grid = ({ col = 4, items = [] }) => {
	mockItems = [1, 2, 3, 4, 5, 6, 7];

	const chunkArrayByCol = (array, chunkSize) => {
		return Array(Math.ceil(array.length / chunkSize))
			.fill()
			.map((_, index) => {
				// For each placeholder, return a slice of the original array
				const start = index * chunkSize;
				return array.slice(start, start + chunkSize);
			});
	};

	const items = chunkArrayByCol(mockItems, col);
	return (
		<>
			{items.map((item, index) => (
				<div className="w-[100]px h-[100]px">{index}</div>
			))}
		</>
	);
};

export default Grid;
