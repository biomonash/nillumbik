import { useEffect, useState, type JSX } from "react";
import Home from "../features/home";
import getExampleApi from "../apis/getExample.api";

const page: React.FC = (): JSX.Element => {
	const [data, setData] = useState(null);

	useEffect(() => {
		getExampleApi().then((res: any) => setData(res));
	})

	useEffect(() => {
		console.log(data);
	}, [data])

	return <Home />;
};

export default page;
