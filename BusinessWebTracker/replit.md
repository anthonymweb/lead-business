# Lead Generator Application

## Overview

This is a full-stack web application designed to help users find businesses without websites and generate sales leads. The application searches for local businesses using the Google Places API, identifies those lacking websites, and provides tools for managing outreach campaigns.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Development**: Hot module replacement via Vite middleware integration

### Data Storage Solutions
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Database Schema
The application uses two main tables:
1. **businesses**: Stores business information including contact status, location data, and website presence
2. **search_history**: Tracks search queries and results for analytics

### Core Features
1. **Business Search**: Integration with Google Places API to find local businesses
2. **Lead Management**: Track contact status (new, contacted, interested, not_interested)
3. **Email Campaign Tools**: Pre-built email templates for outreach
4. **Analytics Dashboard**: Statistics on searches, contacts, and conversion rates
5. **Data Export**: CSV export functionality for lead lists

### API Endpoints
- `POST /api/search`: Search for businesses using Google Places API
- `GET /api/businesses`: Retrieve business listings with filtering options
- `PUT /api/businesses/:id`: Update business contact status and notes
- `GET /api/stats`: Get dashboard statistics
- `GET /api/export`: Export business data as CSV

## Data Flow

1. **Search Flow**: User inputs location and search criteria → API calls Google Places → Results filtered for businesses without websites → Data stored in database
2. **Lead Management**: Users view filtered results → Update contact status → Track outreach progress
3. **Campaign Management**: Generate email templates → Track communication → Update lead status

## External Dependencies

### Google Services
- **Google Places API**: For business discovery and location data
- **Google Geocoding API**: For location coordinate resolution

### Key Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight client-side routing

## Deployment Strategy

### Development
- Vite dev server with HMR for frontend
- TSX execution for backend with auto-restart
- Environment variables for API keys and database connection

### Production Build
- Frontend: Vite build to static assets in `dist/public`
- Backend: ESBuild bundling to `dist/index.js`
- Single server deployment serving both API and static files

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `GOOGLE_PLACES_API_KEY` or `GOOGLE_API_KEY`: Google Places API access

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

- July 08, 2025: Instant messaging system completed (no DNS/complex setup required)
  - Added email column to search results table
  - Implemented simple messaging service with instant delivery options
  - WhatsApp Business API integration (CallMeBot - free tier)
  - TextBelt free SMS service (1 SMS/day per IP)
  - FormSubmit.co email service (no DNS setup required)
  - Webhook automation for manual follow-ups
  - Multi-channel fallback: WhatsApp → SMS → Email → Webhook
  - Platform now sends real messages instantly without SendGrid DNS complications

- July 08, 2025: Production-ready platform completed
  - Integrated Google Places API for real business discovery
  - Added SendGrid email automation system
  - Created professional email templates for outreach
  - Added money-making tips and quick-start guides
  - Fixed all navigation routing issues
  - Platform now ready for immediate lead generation business

- July 07, 2025: Initial setup