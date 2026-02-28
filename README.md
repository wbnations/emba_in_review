This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project utilities

A couple of helper scripts live at the project root to make working with cohort data easier:

* `rename-photos.js` – rename a batch of downloaded headshots so they match the `id` field in `cohort-data.json`. Run with:
  ```bash
  node rename-photos.js
  ```

* `parse-courses.js` – generates the `courseMap` constant used by the dashboard. It looks first for `EMBA_2026.csv` in the project root, or will fall back to the Excel schedule in `public/EMBA Class of 2026 Schedule 2.xlsx` if you have the `xlsx` package installed.
  ```bash
  npm install xlsx   # only needed when parsing the spreadsheet
  node parse-courses.js
  ```

Your console will show a JSON object that can be pasted into `app/page.tsx`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
