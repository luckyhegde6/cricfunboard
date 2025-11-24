# CricFunBoard - Cricket Scoreboard Application

A real-time cricket scoreboard application built with Next.js, MongoDB, and Socket.IO.

## Features

- 🏏 Real-time score updates
- 👥 Multiple user roles (Admin, Scorer, Captain, Vice-Captain, User)
- 📊 Live match tracking
- 🔐 Secure authentication with NextAuth
- 📱 Responsive design
- 🐳 Docker support for easy deployment

## Quick Start (Docker - Recommended)

The fastest way to get started is using Docker:

```bash
npm run local
```

This command will:
1. Start Docker containers (MongoDB + App)
2. Wait for MongoDB to be ready
3. Automatically seed the database with test data
4. Run the app in development mode with hot-reload

After setup completes, visit:
- **Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

### Default Test Users

After seeding, you can login with these test accounts:
- **Admin**: `admin@test.com` / `password123`
- **Scorer**: `scorer@test.com` / `password123`
- **Captain**: `captain@test.com` / `password123`
- **Vice Captain**: `vice@test.com` / `password123`
- **User**: `user@test.com` / `password123`

## Manual Setup

### Prerequisites

- Node.js (LTS version recommended)
- MongoDB (local or Atlas)
- Docker (optional, for containerized setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cricfunboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cricfunboard
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   NEXT_PUBLIC_WS_URL=http://localhost:3001
   ```

4. **Seed the database** (Development only)
   ```bash
   NODE_ENV=development npm run seed:all
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Run the socket server** (Optional, for real-time updates)
   ```bash
   npm run socket
   ```

Visit http://localhost:3000 to see the application.

## Docker Commands

| Command | Description |
|---------|-------------|
| `npm run local` | Quick start: builds, starts containers, and seeds database |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:build` | Build Docker images |
| `npm run docker:logs` | View container logs |
| `npm run docker:terminate` | Stop containers and remove volumes/images |

## Database Seeding

Seed scripts are available to populate the database with test data. They only run in development mode for safety.

### Individual Seed Commands

```bash
NODE_ENV=development npm run seed:users    # Create test users
NODE_ENV=development npm run seed:admin    # Create admin user
NODE_ENV=development npm run seed:scorer   # Create scorer user
NODE_ENV=development npm run seed:teams    # Create test teams
NODE_ENV=development npm run seed:match    # Create test match
NODE_ENV=development npm run seed:all      # Run all seeds in sequence
```

### Force Seeding (Use with caution)

To run seeds in non-development environments:
```bash
FORCE_SEED=true npm run seed:all
```

## API Documentation

Interactive API documentation is available at:
- **Local**: http://localhost:3000/api-docs
- **Swagger UI**: Full OpenAPI 3.0 specification with try-it-out functionality

### API Endpoints Overview

- **Authentication**: `/api/auth/[...nextauth]`
- **Matches**: `/api/matches`, `/api/matches/{id}`, `/api/matches/live`
- **Teams**: `/api/teams`, `/api/teams/{id}`
- **Users**: `/api/users`, `/api/user/password`, `/api/user/role`
- **Admin**: `/api/admin/users`, `/api/admin/settings`

See the full API documentation at `/api-docs` for detailed information on all endpoints, request/response schemas, and authentication requirements.

## User Roles

- **Admin**: Full access to all features, user management, and settings
- **Scorer**: Can create matches, update scores, and manage match events
- **Captain**: Can create and manage their team
- **Vice-Captain**: Can assist in team management
- **User**: Can view matches and scores

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run local` | Quick start: builds, starts containers, and seeds database | 
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:build` | Build Docker images |
| `npm run docker:logs` | View container logs |
| `npm run docker:terminate` | Stop containers and remove volumes/images | 
|
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run linter |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Biome |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run test:coverage` | Run tests with coverage |

### Project Structure

```
cricfunboard/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── api-docs/          # Swagger UI page
│   ├── admin/             # Admin pages
│   ├── matches/           # Match pages
│   └── teams/             # Team pages
├── components/            # React components
├── lib/                   # Utility functions
├── models/                # MongoDB models
├── scripts/               # Seed and utility scripts
├── tests/                 # Test files
├── docker-compose.yml     # Docker configuration
├── Dockerfile             # Docker image definition
└── openapi.yaml          # API specification
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test:coverage
```

## Contributing

### Rules
- **Update Tests**: If adding or changing any code, you MUST also update the related tests in the `tests` folder to ensure they pass and cover the changes.
- **Follow Code Style**: Use the project's linting and formatting rules (`npm run lint:fix` and `npm run format`)
- **Document API Changes**: Update the `openapi.yaml` file if you modify or add API endpoints

## Deployment

### Docker Deployment

1. Build the production image:
   ```bash
   docker-compose build
   ```

2. Start the containers:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | Optional |
| `NODE_ENV` | Environment (development/production) | Auto-set |

### Example env
```
MONGODB_URI=mongodb://localhost:27017/cricfunboard
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=password123
NEXTAUTH_SECRET=some_long_secret
NEXT_PUBLIC_WS_URL=http://localhost:4000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
PORT_WS=4000
```

## License

This project is licensed under the GPL-3.0 License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on the GitHub repository.
