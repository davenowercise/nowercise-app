# Nowercise - Exercise for Cancer Recovery

## Overview

Nowercise is a comprehensive digital health platform designed specifically for cancer patients and exercise specialists. The platform provides personalized, scientifically-validated exercise programs based on ACSM-ACS (American College of Sports Medicine and American Cancer Society) guidelines. It connects patients with exercise specialists to create adapted workout plans and supports cancer survivors through their recovery journey.

## System Architecture

The application follows a full-stack architecture with the following components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom component system
- **UI Components**: Shadcn/ui component library with custom theming
- **State Management**: TanStack Query for server state and React hooks for local state
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the application
- **Authentication**: Replit Auth with session management
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4 for exercise prescription generation

### Deployment Strategy
- **Platform**: Replit with autoscale deployment
- **Environment**: Development and production environments
- **Port Configuration**: Port 5000 with external port 80 mapping

## Key Components

### Patient Onboarding System
- **PAR-Q+ Integration**: Physical Activity Readiness Questionnaire for medical screening
- **Tier Classification**: 4-tier exercise intensity system (conservative to advanced)
- **Cancer-Specific Assessment**: Tailored recommendations by cancer type and treatment phase
- **Comorbidity Factors**: Adjustments for conditions like diabetes, heart disease, osteoporosis

### Exercise Recommendation Engine
- **ACSM Guidelines Compliance**: Evidence-based exercise prescriptions
- **Personalized Workouts**: Adaptive generation based on patient tier and cancer type
- **Exercise Database**: Comprehensive library with phase-specific filtering
- **Multiple Formats**: Both detailed and streamlined workout presentations

### Calendar and Scheduling System
- **4-Week Program Structure**: Interactive calendar showing 12 workout sessions
- **Color-Coded Workouts**: Visual differentiation between exercise types
- **Workout Logging**: RPE (Rate of Perceived Exertion) and pain tracking
- **Progress Tracking**: Completion rates and performance metrics

### Safety and Medical Integration
- **Medical Clearance Workflow**: Guidance for patients requiring medical approval
- **Symptom Monitoring**: Pain and fatigue tracking during exercises
- **Safety Flags**: Automatic detection of high-risk conditions
- **Healthcare Provider Communication**: Email integration for sharing workout logs

## Data Flow

1. **Patient Registration**: Users authenticate via Replit Auth
2. **Medical Screening**: PAR-Q+ questionnaire determines exercise readiness
3. **Onboarding Assessment**: Cancer type, treatment phase, and symptom evaluation
4. **Tier Assignment**: Algorithm calculates appropriate exercise intensity level
5. **Workout Generation**: Personalized exercise plans created based on tier and profile
6. **Calendar Scheduling**: 4-week program with specific workout assignments
7. **Exercise Logging**: Real-time tracking of repetitions, RPE, and pain levels
8. **Progress Analysis**: Performance data aggregation and trend analysis

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL via Neon serverless
- **Authentication**: Replit Auth OpenID Connect
- **AI Services**: OpenAI API for exercise prescription generation
- **Email**: EmailJS for healthcare provider communication
- **Calendar**: FullCalendar for workout scheduling

### UI and Styling
- **Component Library**: Radix UI primitives via Shadcn/ui
- **Styling**: Tailwind CSS with PostCSS
- **Icons**: Lucide React icon library
- **Fonts**: Google Fonts (Montserrat, Open Sans)

### Development Tools
- **TypeScript**: Type checking and development tooling
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production bundling
- **Vite**: Development server and build tool

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` starts development server with hot reload
- **Database**: Automatic provisioning via Replit PostgreSQL module
- **Environment Variables**: Managed through Replit secrets

### Production Deployment
- **Build Process**: Vite builds client assets, ESBuild bundles server
- **Deployment Target**: Replit autoscale infrastructure
- **Database**: PostgreSQL with connection pooling via Neon
- **Static Assets**: Served from `dist/public` directory

### Configuration Management
- **Environment Variables**: `DATABASE_URL`, `OPENAI_API_KEY`, `SESSION_SECRET`
- **Database Schema**: Managed via Drizzle migrations in `/migrations`
- **TypeScript Configuration**: Shared tsconfig for client/server consistency

## Changelog

- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.