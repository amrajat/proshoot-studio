# Headsshot.com - AI Headshot Studio Application

## Overview
Headsshot.com is a Next.js-based AI headshot generation platform that allows users to create professional headshots using AI technology. The application is built with modern web technologies and deployed on Vercel.

## Core Features

### 1. User Authentication & Management
- **Supabase Authentication**: Email/password and Google OAuth integration
- **Google One Tap**: Streamlined login experience with security review compliance
- **Profile Management**: User profiles with full name and metadata
- **Session Management**: Secure session handling with proper logout functionality

### 2. Organization & Team Management
- **Personal Accounts**: Individual user accounts for personal use
- **Organizations**: Team-based accounts with multiple members
- **Role-based Access**: Owner and member roles within organizations
- **Account Switching**: Seamless switching between personal and organization contexts
- **Member Invitations**: Invite system for adding team members

### 3. Studio Creation & Image Upload
- **Multi-image Upload**: Support for 10-20 images per studio
- **File Format Support**: JPEG, PNG, HEIC/HEIF with automatic conversion
- **Smart Cropping**: AI-powered crop suggestions using SmartCrop library
- **Image Processing**: Automatic compression and optimization
- **Drag & Drop Interface**: Intuitive file upload experience
- **Real-time Progress**: Upload progress tracking with status indicators

### 4. AI Training & Generation
- **Custom AI Models**: Train personalized AI models from uploaded photos
- **Multiple Plans**: Different training plans (Standard, Premium, etc.)
- **Background Options**: Various background styles and settings
- **Style Customization**: Different headshot styles and variations
- **Batch Generation**: Generate multiple variations at once

### 5. Credit System & Billing
- **Credit-based Pricing**: Pay-per-use model with credit consumption
- **Team Credits**: Organization-level credit pools
- **Payment Integration**: Stripe/LemonSqueezy integration for payments
- **Plan Selection**: Different pricing tiers and packages

### 6. File Storage & Management
- **Cloudflare R2**: Primary storage for images and data
- **Organized Structure**: `user_id/studio_uuid/` folder organization
- **Focus Data**: JSON files containing crop and focus information
- **Image Delivery**: CDN-optimized image delivery
- **Secure Access**: Authenticated file access and permissions

## Technical Architecture

### Frontend
- **Framework**: Next.js 14+ with App Router
- **UI Library**: Tailwind CSS + Shadcn/UI components
- **State Management**: Zustand for global state
- **File Upload**: React Dropzone with drag-and-drop
- **Image Processing**: Browser-based image compression and conversion

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Cloudflare R2
- **API Routes**: Next.js API routes for server-side operations
- **Image Processing**: Server-side image optimization

### Infrastructure
- **Hosting**: Vercel (main site at proshoot.co)
- **CDN**: Cloudflare for static assets and R2 storage
- **Domain**: Custom domain with SSL
- **Environment**: Production, staging, and development environments

## Key Components

### Authentication Flow
1. User signs up/in via email or Google OAuth
2. Session established with Supabase
3. Profile created/updated in database
4. Context switching available for organizations

### Studio Creation Flow
1. User uploads 10-20 photos
2. Images processed and uploaded to R2 storage
3. Smart crop data generated and stored
4. Focus data JSON file created
5. Payment processed (if needed)
6. AI training job initiated

### File Organization
```
R2 Bucket Structure:
├── user_id/
│   ├── studio_uuid_1/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── focus_data.json
│   └── studio_uuid_2/
│       ├── image1.jpg
│       └── focus_data.json
```

## Recent Improvements (V2 Branch)

### Authentication Enhancements
- Fixed sidebar visibility issues after logout
- Improved session validation and cleanup
- Enhanced Google One Tap integration

### Upload System Fixes
- Resolved path structure issues in R2 uploads
- Fixed focus_data.json upload timing
- Improved error handling and user feedback
- Added proper file validation and sanitization

### UI/UX Improvements
- Responsive sidebar with collapse functionality
- Better loading states and progress indicators
- Improved error messages and user guidance
- Enhanced mobile experience

## Security Features
- **Input Validation**: Server-side file validation and sanitization
- **Authentication**: Secure session management
- **File Access**: Authenticated file access controls
- **CORS**: Proper cross-origin resource sharing setup
- **Environment Variables**: Secure configuration management

## Development Workflow
- **Git Branching**: Feature branches with main/V2 structure
- **Code Quality**: ESLint and Prettier for code formatting
- **Testing**: Component and integration testing
- **Deployment**: Automated deployment via Vercel

## Future Enhancements
- Advanced AI model customization
- More background and style options
- Bulk processing capabilities
- Enhanced team collaboration features
- API for third-party integrations
