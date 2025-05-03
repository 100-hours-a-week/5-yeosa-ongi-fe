import AlbumThumbnail from "./AlbumThumbnail";
import Grid from "./Grid";

const Month = ({ albumIds, title }) => {
	console.log("in Month", albumIds, title);
	return (
		<>
			<div className="h-10 p-1">{title}</div>
			<Grid ElementType={AlbumThumbnail} items={albumIds}></Grid>
		</>
	);
};

export default Month;
