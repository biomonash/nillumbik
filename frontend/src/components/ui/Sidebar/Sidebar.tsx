import React, { use, useState, type JSX } from "react";
import { Center, Stack, Tooltip, UnstyledButton } from "@mantine/core";
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from "./Sidebar.module.scss";
import { useNavigate } from "react-router";

import routes from "../../../constants/route";

interface NavbarLinkProps {
	icon: JSX.Element;
	label: string;
	active?: boolean;
	onClick?: () => void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
	return (
		<Tooltip
			label={label}
			position="right"
			transitionProps={{ duration: 0 }}
		>
			<UnstyledButton
				onClick={onClick}
				className={classes.link}
				data-active={active || undefined}
			>
				{Icon}
			</UnstyledButton>
		</Tooltip>
	);
}

const mockdata = [
	{ icon: <i className="fa-solid fa-house"></i>, label: "Home"},
	{ icon: <i className="fa-solid fa-chart-mixed"></i>, label: "Dashboard" },
	{ icon: <i className="fa-solid fa-rectangle-vertical-history"></i>, label: "Gallery"},
	{ icon: <i className="fa-solid fa-map-location-dot"></i>, label: "Map" },
	{ icon: <i className="fa-solid fa-gear"></i>, label: "Settings" },
];

const Sidebar: React.FC = (): JSX.Element => {
	const [active, setActive] = useState(1);
	const navigate = useNavigate();

	const links = mockdata.map((link, index) => (
		<NavbarLink
			{...link}
			key={link.label}
			active={index === active}
			onClick={() => {
				setActive(index)
				navigate(`${link.label.toLowerCase() != "home" ? link.label.toLowerCase() : ""}`)
			}}
		/>
	));

	return (
		<nav className={classes.navbar}>
			{/* <Center>
				<img src="https://github.com/mantinedev.png" />
			</Center> */}

			<div className={classes.navbarMain}>
				<Stack justify="center" gap={0}>
					{links}
				</Stack>
			</div>

			<Stack justify="center" gap={0}>
				<NavbarLink
					icon={<i className="fa-sharp fa-solid fa-repeat"></i>}
					label="Change account"
				/>
				<NavbarLink icon={<i className="fa-solid fa-right-from-bracket"></i>} label="Logout" />
			</Stack>
		</nav>
	);
}

export default Sidebar;
