# Memory App

A full-stack memory management application built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- ✅ User authentication with NextAuth.js
- ✅ Create and organize memories by categories
- ✅ File upload support (images, documents, PDFs)
- ✅ Beautiful UI with Tailwind CSS and shadcn/ui
- ✅ PostgreSQL database with Prisma ORM
- ✅ Responsive sidebar layout

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with CredentialsProvider
- **File Upload**: Local storage in `/public/uploads`

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd memory-app
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/memory_app"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Set up the database:**

   ```bash
   # Push the schema to your database
   npx prisma db push

   # Generate Prisma client (already done)
   npx prisma generate
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
memory-app/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # NextAuth routes
│   │   │   ├── categories/ # Category management
│   │   │   ├── memories/   # Memory management
│   │   │   └── upload/     # File upload
│   │   ├── auth/           # Authentication pages
│   │   ├── categories/     # Category management pages
│   │   ├── memories/       # Memory management pages
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── app-sidebar.tsx # Application sidebar
│   └── lib/               # Utility libraries
│       ├── auth.ts        # NextAuth configuration
│       ├── db.ts          # Prisma client
│       └── utils.ts       # Utility functions
├── prisma/
│   └── schema.prisma      # Database schema
├── public/
│   └── uploads/           # Uploaded files storage
└── data/                  # Application data storage
```

## Usage

### First Time Setup

1. **Create your account:**

   - Visit `/auth/signup` to create a new account
   - Or use `/auth/signin` if you already have an account

2. **Create categories:**

   - Use the sidebar to create your first category
   - Categories help organize your memories

3. **Add memories:**
   - Click "Add Memory" to create your first memory
   - Attach files like images or documents
   - Organize them by category

### Features

- **Categories**: Organize memories with custom icons and colors
- **File Upload**: Attach images, PDFs, and documents to memories
- **Search & Filter**: Browse memories by category
- **Responsive Design**: Works on desktop and mobile devices

## Database Schema

### User

- `id`: Unique identifier
- `name`: User's display name
- `email`: User's email (unique)
- `password`: Hashed password
- `createdAt`: Account creation timestamp

### Category

- `id`: Unique identifier
- `name`: Category name
- `color`: Category color (hex)
- `icon`: Category icon (emoji)
- `userId`: Owner reference

### Memory

- `id`: Unique identifier
- `title`: Memory title
- `content`: Memory content (text)
- `type`: Memory type (text, image, audio, document)
- `fileUrl`: Optional file attachment URL
- `createdAt`: Creation timestamp
- `categoryId`: Category reference
- `userId`: Owner reference

## API Routes

- `GET /api/memories` - Fetch user's memories
- `POST /api/memories` - Create new memory
- `GET /api/categories` - Fetch user's categories
- `POST /api/categories` - Create new category
- `POST /api/upload` - Upload file
- `POST /api/auth/register` - User registration
- `/api/auth/[...nextauth]` - NextAuth handlers

## Development

### Running Tests

```bash
npm run lint      # Run ESLint
npm run build     # Build for production
npm run start     # Start production server
```

### Database Operations

```bash
npx prisma studio          # Open Prisma Studio
npx prisma db push         # Push schema changes
npx prisma generate        # Regenerate client
npx prisma migrate dev     # Create migration
```

## Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Build and deploy the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
