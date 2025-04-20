# Biocare App

![License: MIT](https://img.shields.io/badge/License-MIT-green)
![Build Status](https://img.shields.io/github/actions/workflow/status/<username>/biocare-app/ci.yml?branch=main)
![Coverage Status](https://img.shields.io/badge/coverage-—%25-brightgreen)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Demo](#demo)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

Biocare is a modern, fast, and responsive healthcare management application built with React, TypeScript, Vite, and Supabase. It provides secure authentication, real-time notifications, file uploads, and an intuitive UI for patients and medical professionals.

## Features

- **Authentication & Authorization**: Email/password login powered by Supabase Auth.
- **Real-time Notifications**: Live updates using Supabase Realtime.
- **File Uploads**: Secure doctor document uploads with Supabase Storage.
- **Responsive UI**: Built with Tailwind CSS and Framer Motion for animations.
- **Unit & E2E Tests**: Vitest for unit tests and Playwright for end-to-end tests.

## Tech Stack

| Layer          | Technology           |
| -------------- | ---------------------|
| Bundler        | Vite                 |
| Frontend       | React, TypeScript    |
| Styling        | Tailwind CSS         |
| UI Animations  | Framer Motion        |
| Backend        | Supabase (Postgres)  |
| Testing        | Vitest, Playwright   |
| Linting        | ESLint               |

## Demo

![App Screenshot](./docs/screenshot.png)

## Prerequisites

- Node.js >= 20
- npm or Yarn

## Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/<username>/biocare-app.git
   cd biocare-app
   ```
2. Copy the example env and fill in your credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase URL and ANON key
   ```
3. Install dependencies:
   ```bash
   npm ci
   ```

## Configuration

Edit `.env` to configure:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development

Start the dev server:
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

## Available Scripts

| Command              | Description                      |
| -------------------- | -------------------------------- |
| `npm run dev`        | Start dev server                 |
| `npm run build`      | Build production bundle          |
| `npm run preview`    | Preview production build         |
| `npm run lint`       | Run ESLint checks                |
| `npm run test`       | Run Vitest unit tests            |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e`   | Run Playwright end-to-end tests  |

## Testing

- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`
- Coverage: `npm run test:coverage`

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'feat: add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Contact

Maintainer: [Your Name](mailto:your.email@example.com)
GitHub: [@<username>](https://github.com/<username>)
