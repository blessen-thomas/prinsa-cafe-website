# Prinsa Café

Official website and admin dashboard for Prinsa Café, built as a full-stack web application.

## Overview

Prinsa Café provides a modern web experience for customers to explore the café's menu, view reviews, get in touch, and access essential café information.

The project also includes an administrative dashboard for managing website content and menu data.

## Features

* 🍽️ Dynamic menu with category-based organization
* ⭐ Customer reviews
* 📩 Contact and enquiry management
* 🔐 Admin dashboard for content management
* 🖼️ Menu and category image management
* 📱 Responsive design for desktop and mobile
* 🗄️ Database-backed content using Supabase/PostgreSQL
* 🌐 Production deployment with Vercel
* 🔒 Environment-based configuration for sensitive credentials

## Tech Stack

**Frontend**

* Next.js
* React
* TypeScript
* CSS

**Backend & Database**

* Next.js API routes
* Supabase
* PostgreSQL

**Tools & Deployment**

* Git
* GitHub
* Vercel

## Project Structure

```text
prinsa-cafe-website/
├── data/                 # Local development data
├── public/               # Static assets
├── src/                  # Application source code
├── supabase/             # Supabase configuration/database resources
├── scripts/              # Utility and migration scripts
├── .env.local.example    # Environment variable template
├── next.config.ts
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/blessen-thomas/prinsa-cafe-website.git
cd prinsa-cafe-website
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file based on `.env.local.example` and configure the required Supabase environment variables.

Never commit `.env.local` or expose private credentials in the repository.

### Run Locally

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deployment

The application is deployed using Vercel.

Production environment variables should be configured through the hosting platform rather than committed to the repository.

## License

This project is maintained for Prinsa Café.
