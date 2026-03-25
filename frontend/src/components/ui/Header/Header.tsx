import { type JSX, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import routes from "../../../constants/route";

const links = [
  { link: routes.ABOUT,       label: "About"     },
  { link: routes.DASHBOARD,   label: "Dashboard" },

];

/*   { link: routes.INSTRUCTION, label: "Community" }, */

const Header: React.FC = (): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const items = links.map((link) => (
    <NavLink
      key={link.label}
      to={link.link}
      onClick={() => { navigate(link.link); setMenuOpen(false); }}
      className={({ isActive }) =>
        [
          "block leading-none px-3 py-2 no-underline rounded",
          "text-sm font-medium text-primary",
          "transition-[color,background-color] duration-200",
          "hover:bg-black/10",
          isActive ? "!bg-sidebar !text-white" : "",
        ].join(" ")
      }
    >
      {link.label}
    </NavLink>
  ));

  return (
    <>
      <header className="h-[var(--header-height)] bg-[var(--header-bg)] fixed top-0 left-0 right-0 z-[100] border-b border-black/10">
        <div className="max-w-screen-xl mx-auto px-4 h-full flex justify-between items-center">

          {/* Logo */}
          <img
            width={40}
            alt="BIOM Logo"
            src="https://planetopija.hr/media/W1siZiIsIjIwMjIvMTEvMTcvMndva3Y2b2dseV9CaW9tX2xvZ28ucG5nIl1d?sha=3f0b53e061c88d79"
            className="cursor-pointer"
            onClick={() => navigate("/")}
          />

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {items}
            <button className="w-9 h-9 flex items-center justify-center rounded text-primary hover:bg-black/10 transition-colors duration-200">
              <i className="fa-solid fa-gear" />
            </button>
          </div>

          {/* Mobile burger */}
          <button
            className="flex sm:hidden items-center justify-center w-9 h-9 rounded hover:bg-black/10 transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} />
          </button>

        </div>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="fixed top-[var(--header-height)] left-0 right-0 bg-[var(--header-bg)] border-b border-black/10 z-[99] flex flex-col px-4 py-3 gap-1 sm:hidden">
          {items}
        </div>
      )}
    </>
  );
};

export default Header;