# SheHealth AI Frontend

SheHealth AI is an advanced, AI-powered clinical decision-support system designed to predict the risk of common female health disorders. This frontend application provides an intuitive interface for users to input clinical data and receive early risk assessments for conditions such as PCOS, Anemia, Thyroid disorders, Osteoporosis, and Breast Cancer.

## Features

- **PCOS Detection**: Screening using hormonal and metabolic indicators.
- **Anemia Detection**: Risk assessment based on hematological parameters.
- **Thyroid Disorder**: Hypo/Hyperthyroidism prediction using thyroid function markers.
- **Osteoporosis Risk**: Bone density risk evaluation using demographic and clinical factors.
- **Breast Cancer Risk**: Early screening based on clinical features.
- **Interactive UI**: Animated and responsive design for a seamless user experience.
- **Real-time Validation**: Form validation using Zod and React Hook Form.

## Tech Stack

This project is built with a modern frontend stack:

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (based on [Radix UI](https://www.radix-ui.com/))
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **State Management/Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [Bun](https://bun.sh/)

### Installation

1.  Clone the repository and navigate to the frontend directory:
    ```bash
    cd shehealth-ai/frontend
    ```


2.  Install dependencies:
    ```bash
    npm install
    # or
    bun install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:8080` (or the port shown in your terminal).

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm test`: Runs tests using Vitest.

## Project Structure

```
src/
├── assets/         # Static assets (images, etc.)
├── components/     # Reusable UI components
│   ├── ui/         # Shadcn UI base components
│   └── ...         # Functional components (Navbar, Footer, DisorderPage, etc.)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions (utils.ts)
├── pages/          # Application pages (Index, PCOSPage, etc.)
├── test/           # Test files
├── App.tsx         # Main application component & routing
└── main.tsx        # Entry point
```
