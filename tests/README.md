# Frontend tests

These tests use Node.js's built-in `node:test` runner and are written in TypeScript. This Markdown file is documentation only; it does not run tests.

## One-time setup

Install the TypeScript runner in the frontend project folder if it is not already installed:

```powershell
npm install --save-dev tsx
```

## Run both test files

From the frontend project folder, run:

```powershell
node --import tsx --test tests/f03-payment-modal-dismissal.test.ts tests/f01-heartbeat-auth.test.ts
```

## Run one test file

```powershell
node --import tsx --test tests/f03-payment-modal-dismissal.test.ts
```

or:

```powershell
node --import tsx --test tests/f01-heartbeat-auth.test.ts
```

When adding a test file, include its path in the command. `npm run build` and `npm start` do not run these tests.
