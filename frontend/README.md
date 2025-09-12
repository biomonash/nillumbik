# Nilumbik Shire Frontend

A modern React + TypeScript application powered by Vite, Mantine UI, and modular folder structure for scalable development.

---

## Frameworks & Libraries

- **React**: UI library
- **TypeScript**: Type safety for frontend
- **Vite**: Fast build and dev server
- **React Router**: Routing for SPA
- **Mantine UI**: React CSS component library
- **SCSS Modules**: Scoped component styling
- **Nivo**: React - charts component library
- **axios**: Integration with API
- **Font Awesome**: decorations with pro icons
- **@fontsource**: Font management (Primary Font: Lato)
- **ESLint**: Linting and code quality

---

## Folder Structure
```
src/
  apis/               # API request logic
  assets/             # Static assets
    icon/
    image/
    video/
  components/         # Reusable UI components
    form/             # Form components (Button, Input, Select)
    ui/               # UI components (Footer, Header, Sidebar)
  constants/          # Static values (messages, routes, etc.)
  features/           # Domain-specific features (about, admin, dashboard, etc.)
  helpers/            # Utility functions
  hooks/              # Custom React hooks
  layouts/            # Layout components
  lib/                # External third-party libraries
  pages/              # Route-level components (Home, Dashboard, Gallery, etc.)
  styles/             # Styling files (Global SCSS, variables, mixins, functions, etc.)
  App.tsx             # Main App component
  main.tsx            # Entry point
  vite-env.d.ts       # Vite environment types
```

---

## Installation & Launch

### Prerequisites
- Node.js (v18+ recommended)

### Setup
```bash
# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev

# Lint your code
npm run lint
# or
yarn lint

# Build for production
npm run build
# or
yarn build
```

---

## References & Acknowledgements
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/start/data/installation)
- [Mantine](https://mantine.dev/core/package/)
- [Mantine UI](https://ui.mantine.dev/)
- [Nivo](https://nivo.rocks/components/)
- [SCSS Template](https://github.com/technoph1le/sass-template/tree/main/sass)
- [Axios](https://axios-http.com/docs/api_intro)
- [Font Awesome](https://fontawesome.com/icons)
- [@fontsource](https://fontsource.org/fonts/lato)
- [ESLint](https://eslint.org/)

---

For more details, see the source code and comments in the `src/` folder.
