import { first, second } from "../../../mock/getMonthlyAlbum";

function fetchAlbumData(params) {
	if (params == null) {
		return first;
	} else {
		return second;
	}
}

export { fetchAlbumData };
