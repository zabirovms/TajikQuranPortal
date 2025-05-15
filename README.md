# Tajik Quran Web Application

A comprehensive Tajik Quran web application providing an immersive digital Quranic experience for Tajik-speaking users, with advanced word-level data management and interactive learning features.

## Features

- Quran reading with Tajik translation
- Beautiful Tajweed color-coding of Arabic text
- Word-by-word translation and analysis
- Audio recitation playback
- Bookmark favorite verses
- Search functionality in Arabic and Tajik
- Dynamic verse image generation
- Responsive design for desktop and mobile devices
- Light/dark theme support
- Customizable reading experience

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **API Integration**: AlQuran Cloud API for audio and additional data

## Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database (or Supabase account)
- NPM or Yarn

## Setup and Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/tajik-quran-app.git
   cd tajik-quran-app
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   - Create a `.env` file in the root directory
   - Add your Supabase or PostgreSQL connection string:
     ```
     DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
     ```

4. Initialize the database
   ```
   npm run db:push
   ```

5. Start the development server
   ```
   npm run dev
   ```

## Deploying to Railway

This project is optimized for deployment on Railway with an improved JavaScript-based build process:

1. Create a new project on [Railway](https://railway.app/)
2. Connect your GitHub repository
3. Add a PostgreSQL database service or connect to Supabase
4. Set up the following environment variables:
   - `DATABASE_URL`: Your Supabase or PostgreSQL connection string
   - `SESSION_SECRET`: A strong secret key for session encryption
   - `NODE_ENV`: Set to `production`
5. The deployment will automatically:
   - Build the client application with code splitting for reduced bundle size
   - Generate optimized server code using esbuild
   - Create a production-ready package.json
   - Start the application with proper path handling

If you encounter any deployment issues:
- Verify your DATABASE_URL environment variable is correctly set
- Check the Railway logs for detailed error information
- The build process is designed to work within Railway's memory constraints
- Vite is configured to split code chunks to avoid memory issues during build

## Database Setup on Supabase

If you're using Supabase instead of a standard PostgreSQL database:

1. Go to the [Supabase dashboard](https://supabase.com/dashboard/projects)
2. Create a new project if you haven't already
3. Once in the project page, click the "Connect" button on the top toolbar
4. Copy URI value under "Connection string" -> "Transaction pooler"
5. Replace `[YOUR-PASSWORD]` with the database password you set for the project
6. Add this URI as your `DATABASE_URL` environment variable

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- AlQuran Cloud API for Quranic data
- Islamic Network for audio recitations
- Contributors to the Tajik translation of the Quran