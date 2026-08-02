# T-Conecta Ciudadano (Mobile Client)

This repository contains the mobile application for **T-Conecta Ciudadano**, developed using React Native and Expo. The application provides end-users with features such as authentication, trip planning, route exploration, wallet management, user profiles, and real-time alerts.

## 🚀 Tech Stack

- **Framework**: React Native (0.83.10) & Expo (~55.0.0)
- **Navigation**: React Navigation (Native Stack, Drawer, Bottom Tabs)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Maps**: React Native Maps
- **Charts**: React Native Chart Kit
- **Icons**: Lucide React Native, Expo Vector Icons
- **Code Quality**: ESLint, Prettier, Husky

## 📁 Folder Structure

The project follows a modular, feature-based architecture:

```text
Client-User-Mobile/
├── .husky/              # Git hooks for code quality (lint-staged, prettier, eslint)
├── assets/              # Static app assets and images
├── src/                 # Main source code
│   ├── features/        # Feature modules
│   │   ├── alerts/      # System alerts and notifications
│   │   ├── auth/        # Authentication screens (Login, Register)
│   │   ├── explore/     # Map and routes exploration
│   │   ├── planner/     # Trip planning functionality
│   │   ├── profile/     # User profile management
│   │   └── wallet/      # Digital wallet and payment management
│   ├── navigation/      # Application routing (AppNavigator, AuthStack, Drawer, MainTabs)
│   └── shared/          # Common resources
│       ├── api/         # Axios instance and API client configuration
│       ├── components/  # Reusable UI components (Button, Input, etc.)
│       ├── constants/   # App constants and endpoint definitions
│       ├── store/       # Zustand global stores (alertsStore, authStore, plannerStore, walletStore)
│       └── utils/       # Utility functions (e.g., haversine distance, luhn algorithm)
├── app.json             # Expo application configuration
├── babel.config.cjs     # Babel configuration
└── package.json         # Project metadata and dependencies
```

## 🔌 API Integrations

The mobile client communicates with several backend microservices. The base URLs can be configured via environment variables (refer to `.env.example`). The primary backend services are:

- **Auth Service**: `http://<HOST>:8080/api`
  Handles user authentication and authorization.
- **User Service**: `http://<HOST>:3003/TRANSMETRO-CONECTA-USUARIO/v1`
  Manages user data, profiles, and citizens' information.
- **Admin Service**: `http://<HOST>:3001/TCONECTA/v1`
  Provides administrative configurations and general system data.
- **Client Service**: `http://<HOST>:3002/TRANSMETRO-CONECTA-CLIENTE/v1`
  Handles client-specific logic such as wallet transactions and trip records.

## 🛠️ Setup and Installation

1. **Install Dependencies**:
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   # or with pnpm (as indicated by pnpm-lock.yaml)
   pnpm install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env` and adjust the variables, including the `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` for map functionality, and the API host URLs.

3. **Run the Application**:
   Start the Expo development server:
   ```bash
   npm start
   # or
   pnpm start
   ```
   You can run the app on Android (`npm run android`), iOS (`npm run ios`), or on the web (`npm run web`).

## 📜 Scripts

- `start`: Starts the Expo bundler.
- `android`: Runs the app on an Android emulator or connected device.
- `ios`: Runs the app on an iOS simulator (requires macOS).
- `web`: Runs the app in a web browser.
- `lint` / `lint:fix`: Lints the codebase using ESLint.
- `format` / `format:check`: Formats the code using Prettier.
