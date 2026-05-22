# HSS React Frontend

This repository contains the React frontend for the HSS platform. It provides separate experiences for customers and administrators, with protected routes, token-based authentication, and API integration through a configurable backend URL.

## Overview

The app is built with React 19 and webpack. It uses React Router for navigation, Axios for API requests, and local storage for storing auth tokens. The UI is split into two main areas:

- Customer flow for login, registration, dashboard, addresses, furniture, and shifts
- Admin flow for login, registration, dashboard, customer management, shift management, and RFID binding

## Features

- Customer authentication and session handling
- Admin authentication and session handling
- Protected routes for customer and admin pages
- REST API integration through a shared Axios layer
- Separate customer and admin auth contexts
- RFID binding support for furniture and ESP device workflows
- Webpack-based development and production builds

## Tech Stack

- React 19
- React Router DOM 7
- Axios
- Webpack 5
- Babel
- CSS Modules and global CSS

## Prerequisites

Before running the app, make sure you have:

- Node.js 18 or newer
- npm 9 or newer
- A running HSS backend API

## Installation

Install dependencies from the project root:

```bash
npm install
```

If you prefer a clean install, remove `node_modules` first and reinstall.

## Environment Configuration

The frontend reads the backend base URL from `REACT_APP_API_URL`.

Create a `.env` file in the project root with:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Adjust the value to match your backend host and port.

## Available Scripts

The following npm scripts are defined in `package.json`:

```bash
npm run start   # Start the development server
npm run dev     # Start the development server
npm run build   # Build the production bundle
npm run test    # Placeholder script; no automated tests are configured
```

## Running the App

Start the development server:

```bash
npm run dev
```

Open the app in your browser at:

```text
http://localhost:3000
```

The development server uses webpack dev server with hot reload and client-side routing fallback.

## Production Build

Create a production build with:

```bash
npm run build
```

The compiled output is written to the `dist/` directory.

## Authentication Flow

The app uses two auth domains:

- Customer auth, which stores its token in `localStorage` under `customer_token`
- Admin auth, which stores its token in `localStorage` under `admin_token`

These tokens are automatically attached to API requests through Axios interceptors.

## Routing

The app redirects the root path to the customer login screen.

Customer routes:

- `/customer/login`
- `/customer/register`
- `/customer/dashboard`
- `/customer/addresses`
- `/customer/furniture`
- `/customer/shifts`

Admin routes:

- `/admin/login`
- `/admin/register`
- `/admin/dashboard`
- `/admin/customers`
- `/admin/shifts`
- `/admin/rfid-binding`

Protected routes require a valid token and are wrapped with their respective route guards.

## API Integration

All requests use the backend URL defined by `REACT_APP_API_URL`.

The main API groups include:

- Auth endpoints for admin login, register, logout, and current user lookup
- Customer auth endpoints for customer login, register, logout, and current customer lookup
- Addresses endpoints for customer address management
- Furniture endpoints for furniture management
- Customer endpoints for admin customer management
- ESP device endpoints for device administration and token retrieval
- RFID binding endpoints for managing furniture-to-RFID bindings

## Project Structure

Key folders in the React app:

- `src/components` for navigation, route guards, and shared layout helpers
- `src/context` for admin and customer auth state
- `src/pages` for the application screens
- `src/services` for API clients and endpoint wrappers
- `src/styles` for shared styling
- `public` for the webpack HTML template

## Troubleshooting

If the app fails to connect to the backend:

- Confirm `REACT_APP_API_URL` is set correctly
- Make sure the backend server is running
- Verify the backend allows requests from the frontend origin
- Check browser dev tools for failed network requests or missing auth tokens

If routes refresh to a blank page in development, confirm you are using the webpack dev server with `historyApiFallback` enabled.

## Notes

- The repository currently does not include automated tests.
- There is a legacy set of page files under `src/pages` with `.js` extensions; the active router imports the `.jsx` pages.

## License

This project is currently marked as `ISC` in `package.json`.
