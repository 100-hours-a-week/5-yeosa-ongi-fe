import AlbumThumbnail from "./AlbumThumbnail";
import Grid from "./Grid";

const Month = ({ albumIds, title }) => {
<<<<<<< HEAD
	let items = [];
	albumIds.forEach((id) => {
		items.push({ ElementType: AlbumThumbnail, element: id });
	});
	return (
		<>
			<div className="h-10 p-1">{title}</div>
			<Grid items={items}></Grid>
=======
	return (
		<>
			<div className="h-10 p-1">{title}</div>
			<Grid ElementType={AlbumThumbnail} items={albumIds}></Grid>
>>>>>>> dev
		</>
	);
};

export default Month;
