# Institution Frontend

## Overview

The Institution Frontend is a dedicated React application designed specifically for institutional users of the TESC system. It provides a tailored interface for institutions to manage their academic programs, students, and other institutional data. This frontend shares the same backend as the Admin Dashboard but serves a different user base with institution-specific functionality.

## Key Differences from Admin Dashboard

- **Target Users**: Institution administrators and staff (vs. system administrators in the admin dashboard)
- **Scope**: Limited to the institution's own data (vs. system-wide data in admin dashboard)
- **Features**: Focused on academic operations and reporting (vs. system configuration and monitoring)

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── common/        # Shared components
│   ├── dashboard/     # Dashboard components
│   ├── layout/        # Layout components
│   └── ui/            # Base UI components
├── contexts/          # React contexts for state
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and helpers
├── pages/             # Page components
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Main dashboard
│   ├── students/      # Student management
│   ├── faculty/       # Faculty management
│   ├── courses/       # Course management
│   └── reports/       # Reporting
├── routes/            # Application routes
├── services/          # API services
│   ├── api.ts         # API client
│   ├── auth.ts        # Authentication service
│   └── ...            # Other services
└── types/             # TypeScript type definitions
```

## Key Features

### 1. Authentication & Authorization
- Institution-specific login
- Role-based access control
- Session management

### 2. Dashboard
- Overview of institutional metrics
- Quick access to important functions
- Notifications and alerts

### 3. Student Management
- Student registration and enrollment
- Academic progress tracking
- Document management

### 4. Academic Management
- Course and program management
- Class scheduling
- Gradebook and assessment

### 5. Reporting
- Academic performance reports
- Enrollment statistics
- Custom report generation

## Integration with Backend

The institution frontend communicates with the same backend as the admin dashboard but accesses different endpoints and data scopes based on the authenticated user's institution and role.

### API Authentication
- JWT-based authentication
- Token refresh mechanism
- Role-based endpoint access

### Data Scoping
- All API responses are automatically scoped to the user's institution
- Cross-institution data access is restricted
- Audit logging of all data access

## Development Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=TESC Institution Portal
# Other environment-specific variables
```

## Deployment

The institution frontend is deployed as a static web application and can be hosted on any web server or CDN. The build process generates optimized production files in the `dist` directory.

### Build Process
```bash
# Install dependencies
npm ci

# Build for production
npm run build

# The built files will be in the 'dist' directory
```

## Security Considerations

- All API requests include authentication tokens
- Sensitive data is never stored in client-side storage
- CSRF protection
- XSS prevention through proper escaping
- Content Security Policy (CSP) implementation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting for faster initial load
- Lazy loading of non-critical components
- Image optimization
- Caching strategies for API responses

## Monitoring and Error Tracking

- Error boundary components
- Error logging to backend
- Performance monitoring
- User session tracking (anonymized)

## Upgrading

When upgrading the application:
1. Check the changelog for breaking changes
2. Update dependencies
3. Test thoroughly in staging
4. Deploy during low-usage periods
5. Monitor for issues post-deployment
