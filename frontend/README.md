# Spendora Frontend

This is the frontend for the Spendora expense tracker app, built with React, Vite, and Material UI.

## Features

- User authentication
- Dashboard with expense summaries
- Expense management
- Income management
- Category management
- AI Chat assistant for natural language expense tracking
- Responsive design

## Setup

1. Clone the repository:
```
git clone <repository-url>
cd spendora/frontend
```

2. Install dependencies:
```
npm install
```

3. Start the development server:
```
npm run dev
```

4. Build for production:
```
npm run build
```

## AI Chat Feature

The AI chat assistant allows users to:

1. Add expenses using natural language (e.g., "I spent $20 on lunch today")
2. Query their spending (e.g., "How much did I spend on food last week?")
3. Get insights about their financial habits

To use this feature, navigate to the "Chat" section from the sidebar. The chat interface allows you to type messages and get responses from the AI assistant.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
