# Euro Asia Global Ventures

A modern job board and recruitment platform built with Next.js, MongoDB, and Tailwind CSS.

## Features

- Job listings with advanced filtering
- Admin dashboard for job management
- Application system with email notifications
- Responsive design
- Modern UI with animations

## Tech Stack

- Next.js 14
- MongoDB
- Tailwind CSS
- Framer Motion
- TypeScript
- Resend (for emails)

## Environment Variables

The following environment variables are required:

```env
MONGODB_URI=your_mongodb_connection_string
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=your_admin_email
```

## Deployment on Vercel

1. Fork or clone this repository to your GitHub account
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository
4. Add the required environment variables in Vercel's project settings
5. Deploy!

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
