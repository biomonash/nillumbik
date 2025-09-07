import React, { type JSX } from "react";
import { ActionIcon, Container, Group, Text } from '@mantine/core';
import classes from './Footer.module.scss';

const Footer: React.FC = (): JSX.Element => {
	return (
		<footer className={classes.footer}>
			<Container className={classes.afterFooter}>
				<Text c="dimmed" size="sm">
					© 2020 mantine.dev. All rights reserved.
				</Text>

				<Group
					gap={0}
					className={classes.social}
					justify="flex-end"
					wrap="nowrap"
				>
					<ActionIcon size="lg" color="gray" variant="subtle">
                        <i className="fa-brands fa-github"></i>
					</ActionIcon>
					<ActionIcon size="lg" color="gray" variant="subtle">
						<i className="fa-brands fa-youtube"></i>
					</ActionIcon>
					<ActionIcon size="lg" color="gray" variant="subtle">
						<i className="fa-brands fa-linkedin"></i>
					</ActionIcon>
				</Group>
			</Container>
		</footer>
	);
};

export default Footer;
