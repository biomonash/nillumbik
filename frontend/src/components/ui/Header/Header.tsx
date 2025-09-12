import { useState, type JSX } from "react";
import { Burger, Container, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

// import { MantineLogo } from "@mantinex/mantine-logo";
import classes from "./Header.module.scss";
import { NavLink, useNavigate } from "react-router";

import routes from "../../../constants/route";

const links = [
	{ link: routes.HOME, label: "Home" },
	{ link: routes.ABOUT, label: "About" },
	{ link: routes.DASHBOARD, label: "Dashboard" },
	{ link: routes.INSTRUCTION, label: "Community" },
];

const Header: React.FC = (): JSX.Element => {
	const [opened, { toggle }] = useDisclosure(false);
	const [active, setActive] = useState(links[0].link);

	const navigate = useNavigate();

	const items = links.map((link) => (
		<NavLink
			key={link.label}
			to={link.link}
			className={classes.link}
			data-active={active === link.link || undefined}
			onClick={(event: any) => {
				event.preventDefault();
				setActive(link.link);
				navigate(link.link);
			}}
		>
			{link.label}
		</NavLink>
	));

	return (
		<header className={classes.header}>
			<Container size="md" className={classes.inner}>
				<img width={40} alt="BIOM Logo" src="https://planetopija.hr/media/W1siZiIsIjIwMjIvMTEvMTcvMndva3Y2b2dseV9CaW9tX2xvZ28ucG5nIl1d?sha=3f0b53e061c88d79" />
				<Group gap={5} visibleFrom="xs">
					{items}
				</Group>

				<Burger
					opened={opened}
					onClick={toggle}
					hiddenFrom="xs"
					size="sm"
				/>
			</Container>
		</header>
	);
}

export default Header;