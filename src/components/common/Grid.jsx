const Grid = ({ col = 4, items = [] }) => {
	const chunkArrayByCol = (array, chunkSize) => {
		if (!array || array.length === 0) {
			return [];
		} else {
			return Array(Math.ceil(array.length / chunkSize))
				.fill()
				.map((_, index) => {
					// For each placeholder, return a slice of the original array
					const start = index * chunkSize;
					return array.slice(start, start + chunkSize);
				});
		}
	};
	const chunkArray = chunkArrayByCol(items, col);
	return (
		<>
			{chunkArray.map((array, index) => (
				<div
					className={`grid`}
					style={{
						gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
						height: `calc(min(100vw,560px) / ${col})`,
					}}>
					{array.map((item, index) => (
						<div>
							<item.ElementType
								id={item.element}
								{...item.props}></item.ElementType>
						</div>
					))}
				</div>
			))}
		</>
	);
};

export default Grid;
