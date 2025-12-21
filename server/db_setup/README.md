# Database Setup

This folder contains the complete schema definition for the application.

## Usage

When setting up a **new environment** (e.g., Production, Staging, or a new Developer machine):

1.  Ensure your `.env` file is created and contains the `DATABASE_URL` for the target database.
2.  Run the setup script:

```bash
npm run db:setup
```

## Structure

-   `index.js`: The main executable script that connects to the database and runs the migration.
-   `schema_definitions.js`: Contains the declarative definitions of all:
    -   Tables (`ipo`, `registrar`, etc.)
    -   Extra Columns (for migrations)
    -   Foreign Key Constraints

## Adding New Schema Changes

If you need to add a new table or column:

1.  Open `schema_definitions.js`.
2.  Add the new Table object to `tableDefinitions` OR add the new Column to `requiredColumns`.
3.  Run `npm run db:setup` to apply and test.
