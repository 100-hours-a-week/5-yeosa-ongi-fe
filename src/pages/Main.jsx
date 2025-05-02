import Grid from "../components/Grid";

const Main = () => {
	return (
		<>
			<div className="h-[80px]">Header</div>
			<div className="flex-col content">
				<div className="flex w-full border-2 border-solid">지도</div>
				<div>앨범 리스트</div>
				<Grid />
			</div>
		</>
	);
};

export default Main;
