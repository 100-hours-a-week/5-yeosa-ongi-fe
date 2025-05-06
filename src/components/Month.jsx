import AlbumThumbnail from "./AlbumThumbnail";
import Grid from "./Grid";

const Month = ({ albumIds, title }) => {
	let items = [];
	albumIds.forEach((id) => {
		items.push({ ElementType: AlbumThumbnail, element: id });
	});
	return (
		<>
			<div className="h-10 p-1">{title}</div>
			<Grid items={items}></Grid>
		</>
	);
};

export default Month;
