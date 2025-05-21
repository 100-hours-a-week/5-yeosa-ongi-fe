import Grid from "@/components/common/Grid";
import AlbumThumbnail from "./AlbumThumbnail";

const Month = ({ albumIds, title }) => {
	let items = [];
	albumIds.forEach((id) => {
		items.push({ ElementType: AlbumThumbnail, element: id });
	});
	return (
		<>
			<div className="h-8 p-1 ml-2 text-md">{title}</div>
			<Grid items={items}></Grid>
		</>
	);
};

export default Month;
