import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAlbumDetail } from "../api/albums/albumDetail";
import Card from "../components/Card";
import Category from "../components/Category";
import Header from "../components/Header";

const Album = () => {
	const mock = [{ tag: "카테고리 1" }];
	const { albumId } = useParams();

	useEffect(() => {
		const fetchData = async () => {
			const response = await getAlbumDetail(albumId);
			console.log(response);
		};
		fetchData();
	}, [albumId]);

	return (
		<>
			<Header />
			<Card />
			<div>카테고리</div>
			{}
			<Category />
		</>
	);
};

export default Album;
