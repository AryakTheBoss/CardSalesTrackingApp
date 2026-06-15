# Apex Collects - Pokémon Card Inventory & Sales Tracker

A modern, responsive web application for tracking Pokémon card inventory and sales. Designed specifically for collectors and sellers, this app helps you manage your graded slabs and raw cards, track your profits over time, and keep your data synced.

## Features

- **Dashboard**: Track your overall profits year-to-date with a responsive bar chart.
- **Inventory Management**: Separate tabs for Graded Slabs and Raw Cards. Includes support for logging grading companies (PSA, CGC, BGS, TAG) and raw card conditions (NM, LP, MP, HP, DMG).
- **Sales Tracking**: Easily move items from your inventory into sales, automatically calculating your profit margins.
- **Excel Sync**: Upload your master `.xlsx` spreadsheet to instantly sync your Slabs Inventory, Raw Inventory, and All-Time Sold data straight into the application.
- **Local Persistence**: All data is securely saved in your browser's local storage.

## Tech Stack
- React
- Vite
- Zustand (State Management)
- Recharts (Data Visualization)
- SheetJS (Excel Parsing)
- Lucide React (Icons)

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment
This project is configured to be automatically deployed to GitHub Pages via GitHub Actions whenever changes are pushed to the `main` branch.
