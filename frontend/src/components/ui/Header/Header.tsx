import { useState, type JSX } from "react";
import { Burger, Container, Group, Collapse, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

// import { MantineLogo } from "@mantinex/mantine-logo";
import classes from "./Header.module.scss";
import { NavLink, useNavigate } from "react-router";

import routes from "../../../constants/route";

const links = [
  { link: routes.ABOUT, label: "About" },
  { link: routes.DASHBOARD, label: "Dashboard" },
  { link: routes.INSTRUCTION, label: "Community" },
  //{ link: routes.USERS, label: "User Icon Here" }  //
];

const Header: React.FC = (): JSX.Element => {
  const [opened, { toggle }] = useDisclosure(false);
  const navigate = useNavigate();

  const items = links.map((link) => (
    <NavLink
      key={link.label}
      to={link.link}
      className={({ isActive }) =>
        `${classes.link} ${isActive ? classes.active : ""}`
      }
      onClick={() => {
        navigate(link.link);
        toggle();
      }}
    >
      {link.label}
    </NavLink>
  ));

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <img
          width={40}
          alt="BIOM Logo"
          src="https://planetopija.hr/media/W1siZiIsIjIwMjIvMTEvMTcvMndva3Y2b2dseV9CaW9tX2xvZ28ucG5nIl1d?sha=3f0b53e061c88d79"
        />
        <Group gap={5} visibleFrom="xs">
          {items}
		  <span className={classes.iconWrapper}>
			<i className="fa-solid fa-gear"></i>
		</span>
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
	  {/*
	  Burger menu only when needed
      <Collapse in={opened}>
        <Paper shadow="sm" p="sm">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {items}
          </div>
        </Paper>
      </Collapse>
	  */}
    </header>
  );
};

export default Header;
