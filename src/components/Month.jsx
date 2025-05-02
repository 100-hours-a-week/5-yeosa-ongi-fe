import AlbumThumbnail from "./AlbumThumbnail";
import Grid from "./Grid";

const Month = (albums) => {
	console.log("in Month", albums);
	return (
		<>
			<div> Title : </div>
			<Grid ElementType={AlbumThumbnail} items={albums}></Grid>
		</>
	);
};

export default Month;
