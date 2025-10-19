# DataSov Frontend

A modern React frontend application for the DataSov hybrid blockchain platform that enables secure digital identity management and data ownership trading.

## 🚀 Features

-   **Digital Identity Management**: Register and manage verified digital identities
-   **Data Marketplace**: Browse, list, and purchase data with transparent pricing
-   **Real-time Analytics**: Track earnings, performance, and system health
-   **Cross-chain Integration**: Seamless interaction with Corda and Solana networks
-   **Modern UI/UX**: Responsive design with Tailwind CSS and Framer Motion
-   **Authentication**: Secure user authentication and session management
-   **Real-time Updates**: Live system status and transaction monitoring

## 🛠️ Technology Stack

-   **React 18** - Modern React with hooks and concurrent features
-   **TypeScript** - Type-safe development
-   **Tailwind CSS** - Utility-first CSS framework
-   **React Router** - Client-side routing
-   **React Query** - Server state management and caching
-   **React Hook Form** - Form handling and validation
-   **Framer Motion** - Smooth animations and transitions
-   **Recharts** - Data visualization and charts
-   **Heroicons** - Beautiful SVG icons
-   **Axios** - HTTP client for API communication

## 📦 Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd datasov/frontend
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

4. **Start the development server**
    ```bash
    npm start
    ```

The application will be available at `http://localhost:3000`.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Authentication
REACT_APP_AUTH_ENABLED=true

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true

# Development
REACT_APP_DEBUG=true
```

### API Integration

The frontend integrates with the DataSov Integration Layer API:

-   **Base URL**: Configured via `REACT_APP_API_URL`
-   **Authentication**: JWT token-based authentication
-   **Endpoints**: RESTful API for all operations
-   **Real-time**: WebSocket connections for live updates

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Header.tsx      # Top navigation bar
│   └── ...
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Identities.tsx  # Identity management
│   ├── DataMarketplace.tsx # Data marketplace
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication logic
│   ├── useDataListings.ts # Data listing operations
│   └── ...
├── services/            # API services
│   └── api.ts          # API client
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types
├── utils/              # Utility functions
└── assets/              # Static assets
```

## 🎨 UI Components

### Core Components

-   **Layout**: Main application layout with sidebar and header
-   **Cards**: Reusable card components for data display
-   **Forms**: Form components with validation
-   **Modals**: Modal dialogs for user interactions
-   **Charts**: Data visualization components
-   **Tables**: Data tables with sorting and filtering

### Design System

-   **Colors**: Primary, secondary, success, warning, error palettes
-   **Typography**: Inter font family with consistent sizing
-   **Spacing**: Tailwind's spacing scale
-   **Animations**: Smooth transitions and micro-interactions
-   **Responsive**: Mobile-first responsive design

## 🔐 Authentication

The application supports multiple authentication methods:

-   **Email/Password**: Traditional authentication
-   **Social Login**: OAuth integration (planned)
-   **Wallet Connection**: Web3 wallet integration (planned)

### Auth Flow

1. User registers or logs in
2. JWT token is stored securely
3. Token is included in API requests
4. Automatic token refresh
5. Secure logout with token cleanup

## 📊 Data Management

### State Management

-   **React Query**: Server state and caching
-   **React Context**: Global application state
-   **Local Storage**: Persistent user preferences
-   **Session Storage**: Temporary data

### Data Flow

1. **API Calls**: Centralized through service layer
2. **Caching**: Automatic caching with React Query
3. **Optimistic Updates**: Immediate UI updates
4. **Error Handling**: Comprehensive error management
5. **Loading States**: User-friendly loading indicators

## 🎯 Key Features

### Dashboard

-   System health monitoring
-   Performance metrics
-   Recent activity feed
-   Quick action buttons

### Identity Management

-   Digital identity registration
-   KYC verification status
-   Identity proof generation
-   Access control management

### Data Marketplace

-   Browse available data listings
-   Advanced search and filtering
-   Data type categorization
-   Price comparison tools

### Analytics

-   Earnings tracking
-   Performance metrics
-   Data type popularity
-   Market trends analysis

## 🚀 Deployment

### Development

```bash
npm start
```

### Production Build

```bash
npm run build
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build ./build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```

### Environment Configuration

-   **Development**: Local development with hot reload
-   **Staging**: Pre-production testing environment
-   **Production**: Optimized build for production

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

## 📱 Responsive Design

The application is fully responsive and optimized for:

-   **Desktop**: Full-featured experience
-   **Tablet**: Adapted layout and navigation
-   **Mobile**: Touch-optimized interface

### Breakpoints

-   **Mobile**: < 640px
-   **Tablet**: 640px - 1024px
-   **Desktop**: > 1024px

## 🔒 Security

### Security Features

-   **HTTPS**: Secure communication
-   **JWT Tokens**: Secure authentication
-   **Input Validation**: Client and server-side validation
-   **XSS Protection**: Content Security Policy
-   **CSRF Protection**: Cross-site request forgery prevention

### Best Practices

-   Secure token storage
-   Input sanitization
-   Error message security
-   Secure API communication

## 🎨 Customization

### Theming

The application supports theming through CSS custom properties:

```css
:root {
    --primary-color: #3b82f6;
    --secondary-color: #0ea5e9;
    --success-color: #22c55e;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
}
```

### Branding

-   Logo customization
-   Color scheme modification
-   Typography adjustments
-   Component styling

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards

-   TypeScript strict mode
-   ESLint configuration
-   Prettier formatting
-   Comprehensive testing

## 📞 Support

### Getting Help

-   GitHub Issues
-   Documentation Wiki
-   Community Forum
-   Technical Support

### Resources

-   API Documentation
-   Component Library
-   Design System
-   Best Practices Guide

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Projects

-   **DataSov Corda Component**: Identity management on Corda
-   **DataSov Solana Component**: Data marketplace on Solana
-   **DataSov Integration Layer**: Cross-chain bridge service

---

**DataSov Frontend** - Empowering users with data ownership through modern web technology! 🚀
