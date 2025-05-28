import { memo, useCallback, useMemo } from "react";

const Grid = memo(({ col = 4, items = [] }) => {
	const chunkArrayByCol = useCallback((array, chunkSize) => {
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
	}, []);

	const chunkArray = useMemo(() => {
		return chunkArrayByCol(items, col);
	}, [items, col, chunkArrayByCol]);

	return (
		<>
			{chunkArray.map((array, rowIndex) => (
				<div
					key={`row-${rowIndex}`}
					className="grid"
					style={{
						gridTemplateColumns: `repeat(${col}, minmax(0, 1fr))`,
						height: `calc(min(100vw,560px) / ${col})`,
					}}>
					{array.map((item, index) => (
						<item.ElementType
							id={item.element}
							key={item.id || `${rowIndex}-${index}`}
							{...item.props}></item.ElementType>
					))}
				</div>
			))}
		</>
	);
});

export default Grid;
