const Grid = ({ col = 4, items = [] }) => {
	console.log(items[0].ElementType);
	const chunkArrayByCol = (array, chunkSize) => {
		if (!array || array.length === 0) {
			return <div>데이터가 없습니다.</div>;
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
					className={`grid grid-cols-4`}
					style={{ height: `calc(100vw / ${col})` }}>
					{array.map((item, index) => (
						<div className="border-[1px] border-solid">
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
