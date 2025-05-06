import Card from "../components/Card";
import Category from "../components/Category";
import Header from "../components/Header";

const Album = () => {
	const mock = [{ tag: "카테고리 1" }];
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
