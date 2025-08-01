# PJIAE 360 Platform

**PJIAE 360** is a comprehensive employee performance management platform built with **React 18**, **TypeScript**, **Vite**, and **Supabase**. It provides a complete solution for goal setting, performance appraisals, competency evaluations, and organizational analytics with enterprise-grade security and role-based access control.

## 🌟 Key Features

### **Complete Performance Management Lifecycle**
* **Goal Management**: Goal creation, tracking, and alignment across organizational levels
* **Performance Appraisals**: Comprehensive evaluation system with competency assessments
* **Digital Sign-off**: Secure digital signatures for appraisal completion
* **360-Degree Feedback**: Multi-source feedback collection and analysis
* **Analytics Dashboard**: Real-time performance metrics and organizational insights

### **Advanced Onboarding System**
* **Guided Setup Flow**: Step-by-step organization configuration
* **Employee Import**: CSV import with intelligent column mapping
* **Draft Recovery**: Auto-save and recovery of incomplete setups
* **Role Assignment**: Automated role-based access configuration
* **Appraisal Cycle Setup**: Customizable review periods and competency frameworks

### **Role-Based Access Control**
* **5-Tier Role System**: Admin, Director, Manager, Supervisor, Employee
* **Dynamic Navigation**: Role-specific dashboards and functionality
* **Permission Guards**: Granular access control throughout the application
* **Security Audit**: Comprehensive logging and monitoring

### **Enterprise Features**
* **Email Automation**: Branded email notifications via Supabase Edge Functions
* **Mobile Responsive**: Optimized experience across all devices
* **Data Analytics**: Advanced reporting and visualization
* **Organizational Chart**: Interactive hierarchy visualization
* **Calendar Integration**: Appraisal scheduling and deadline management

## 🛠 Technology Stack

### **Frontend Architecture**
* **React 18** with React Router for navigation
* **TypeScript** for type safety and developer experience
* **Vite** for lightning-fast development and builds
* **Tailwind CSS** with custom design system
* **shadcn/ui** component library with extensive customization
* **Framer Motion** for smooth animations and transitions

### **Backend & Database**
* **Supabase** for authentication, database, and real-time features
* **PostgreSQL** with Row Level Security (RLS)
* **Supabase Edge Functions** for serverless operations
* **Email Service Integration** via Resend API

### **State Management & Data**
* **TanStack Query (React Query)** for server state management
* **Zustand** for client state management
* **React Hook Form** with Zod validation
* **Optimistic Updates** for enhanced user experience

### **UI/UX Libraries**
* **TanStack Table** for advanced data tables
* **Recharts** for data visualization
* **React Calendar** for scheduling
* **Sonner** for toast notifications
* **Radix UI** primitives for accessibility

## 🏗 System Architecture

### **Role-Based Dashboard System**
```
├── Admin Dashboard     # System administration, user management, analytics
├── Director Dashboard  # Strategic oversight, division-level analytics
├── Manager Dashboard   # Team management, goal alignment, appraisals
├── Supervisor Dashboard# Direct reports, performance tracking
└── Employee Dashboard  # Personal goals, self-assessment, feedback
```

### **Core Modules**
```
├── Authentication     # Supabase Auth with email verification
├── Onboarding        # Multi-step organization setup
├── Goals Management  # Goal creation with hierarchical alignment
├── Appraisals       # Performance evaluation workflows
├── Analytics        # Real-time reporting and insights
├── Admin Tools      # User management, system configuration
└── Security         # Audit logs, permission management
```

## 🚀 Getting Started

### **Prerequisites**
* Bun (recommended package manager)
* Supabase account (for backend services)

### **Installation**

1. **Install dependencies**
```bash
bun install
```

2. **Environment Setup**
```bash
cp .env.example .env.local
```
Configure your Supabase credentials in `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Start development server**
```bash
bun dev
```

4. **Build for production**
```bash
bun run build
```

## 📁 Project Structure

```
src/
├── components/          # React components organized by feature
│   ├── admin/          # Administrative tools and dashboards
│   ├── appraisals/     # Performance evaluation workflows
│   ├── auth/           # Authentication forms and flows
│   ├── goals/          # Goal management system
│   ├── onboarding/     # Setup and configuration flows
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   └── layouts/        # Page layouts and navigation
├── hooks/              # Custom React hooks for data and logic
├── lib/                # Utility functions and configurations
├── pages/              # Route components and page layouts
├── stores/             # Zustand state management
├── integrations/       # Supabase client and type definitions
└── types/              # TypeScript type definitions

supabase/
├── functions/          # Edge Functions for email and data processing
├── migrations/         # Database schema and migrations
└── config.toml         # Supabase project configuration
```

## 🔐 Security Features

### **Data Protection**
* **Row Level Security (RLS)** on all database tables
* **JWT-based authentication** with automatic token refresh
* **Organization-scoped data access** preventing cross-tenant data leaks
* **Input sanitization** and validation at all entry points

### **Audit & Compliance**
* **Comprehensive audit logging** for all user actions
* **Role change tracking** with detailed security logs
* **Failed login attempt monitoring**
* **Real-time security alerting**

### **Access Control**
* **Granular permission system** based on organizational roles
* **Route-level protection** with role verification
* **API endpoint security** with Supabase RLS policies
* **Session management** with secure logout

## 📊 Analytics & Reporting

### **Dashboard Metrics**
* **Performance KPIs**: Goal completion rates, appraisal scores
* **Team Analytics**: Department and division-level insights
* **Trend Analysis**: Historical performance data visualization

### **Reporting Features**
* **Real-time dashboards** with interactive charts
* **Export capabilities** for compliance and reporting
* **Custom date ranges** and filtering options
* **Mobile-optimized views** for executive dashboards

## 📧 Email Integration

### **Automated Communications**
* **Welcome emails** for new user onboarding
* **Appraisal reminders** and deadline notifications
* **Goal milestone alerts** and achievement recognition
* **System notifications** for administrative updates

### **Email Templates**
* **Branded templates** with organization customization
* **Responsive design** for all email clients
* **Multi-language support** capabilities
* **Delivery tracking** and analytics

## 🎨 Design System

The platform uses a comprehensive design system built on Tailwind CSS:

* **Semantic color tokens** defined in `index.css`
* **Consistent component variants** via `class-variance-authority`
* **Dark/light mode support** with automatic system detection
* **Responsive design** with mobile-first approach
* **Accessibility compliance** with WCAG 2.1 guidelines

## 🧪 Development Guidelines

### **Code Standards**
* **TypeScript strict mode** for type safety
* **ESLint + Prettier** for code formatting
* **Component-driven development** with reusable patterns
* **Custom hooks** for business logic separation
* **Error boundaries** for graceful error handling

### **Testing Strategy**
* **Unit tests** for utilities and hooks
* **Component testing** with React Testing Library
* **Integration tests** for critical user flows
* **End-to-end testing** for complete scenarios

### **Performance Optimization**
* **Code splitting** with React.lazy and Suspense
* **Optimistic updates** for immediate user feedback
* **Query optimization** with React Query caching
* **Image optimization** and lazy loading
* **Bundle size monitoring** and optimization

## 🚢 Deployment

### **Production Deployment**
The platform is optimized for deployment on:
* **Vercel** (recommended for Vite applications)
* **Netlify** with automatic builds
* **Custom servers** with Docker containerization

### **Environment Configuration**
* **Environment variables** for API keys and configuration
* **Build-time optimization** with Vite
* **CDN integration** for static assets
* **Database migrations** via Supabase CLI

## 📚 API Documentation

### **Supabase Integration**
* **Real-time subscriptions** for live data updates
* **Row Level Security policies** for data access control
* **Edge Functions** for serverless operations
* **Storage integration** for file uploads (when needed)

### **Custom Hooks**
The platform includes over 30+ custom hooks for:
* **Authentication state management**
* **Data fetching and caching**
* **Form validation and submission**
* **Real-time notifications**
* **Role-based permissions**

## 🤝 Contributing

1. **Fork the repository** and create a feature branch
2. **Follow the code standards** defined in `STYLE_GUIDE.md`
3. **Write tests** for new functionality
4. **Run linting and tests** before submitting
5. **Submit a pull request** with detailed description

### **Development Setup**
```bash
# Install dependencies
bun install

# Start development server
bun dev

# Run tests
bun test

# Lint code
bun run lint

# Format code
bun run format
```

## 📄 License

This project is provided for demonstration and educational purposes. Please review the license terms before commercial use.

## 🔗 Resources

* **[Live Demo](https://pjiae360.com/)** - Experience the platform
* **[Documentation](https://deepwiki.com/joshua-sx/pjiae-360)** - Comprehensive guides
* **[API Reference](https://supabase.com/docs)** - Supabase integration
* **[Design System](./STYLE_GUIDE.md)** - Component guidelines
* **[Contributing](./CONTRIBUTING.md)** - Development guidelines

---

**PJIAE 360** - Transforming performance management through intelligent goal setting and comprehensive appraisal systems.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/joshua-sx/pjiae-360)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/joshua-sx/pjiae-360?utm_source=oss&utm_medium=github&utm_campaign=joshua-sx%2Fpjiae-360&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)