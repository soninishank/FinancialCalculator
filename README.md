# Hashmatic Financial Calculators

A comprehensive suite of financial calculators (SIP, EMI, Loan, FIRE, etc.) built with **Next.js** for optimal performance and SEO.

## Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** React Context (Currency, etc.)
- **Icons:** [Lucide React](https://lucide.dev/)

## Getting Started

First, install the dependencies:

```bash
npm install
```

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The page auto-updates as you edit the file.

### Production Build

To create an optimized production build:

```bash
npm run build
```

The output will be in the `.next` folder.

To start the production server locally:

```bash
npm start
```

### Verification Scripts

- `npm run verify:calculators`: Checks for inconsistencies in calculator configurations.
- `npm run lint`: Runs ESLint to check for code quality issues.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
    - `layout.js`: Root layout with global styles and providers.
    - `page.js`: Homepage (redirects to calculators).
    - `calculators/`: Logic for calculator listing and detail pages.
- `src/components/`: Reusable UI components and Calculator logic components.
- `src/utils/`: Helper functions and `calculatorsManifest.js`.
- `public/`: Static assets (images, icons).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.