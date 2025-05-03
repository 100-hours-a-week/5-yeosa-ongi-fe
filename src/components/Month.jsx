import AlbumThumbnail from "./AlbumThumbnail";
import Grid from "./Grid";

const Month = ({ albums, title }) => {
	console.log("in Month", albums, title);
	return (
		<>
			<div className="h-10 p-1">{title}</div>
			<Grid ElementType={AlbumThumbnail} items={albums}></Grid>
		</>
	);
};

export default Month;
