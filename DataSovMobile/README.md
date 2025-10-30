# DataSov Mobile App (Lightweight Version)

A lightweight mobile application for the DataSov platform that provides a simple interface for users to monetize their personal data.

## 🚀 Features

### Core Features

-   **Data Collection Management**: Settings for location, app usage, health data, and purchase history collection
-   **Revenue Display**: Current earnings and history display
-   **Simple UI**: Intuitive and user-friendly interface
-   **Settings Management**: Basic app configuration

### Screen Structure

1. **Home Screen**: Revenue overview and quick actions
2. **Data Collection Screen**: Data type-specific collection settings
3. **Revenue Details Screen**: Earnings history and goal management
4. **Settings Screen**: Basic app settings

## 📱 Technical Specifications

### Dependencies (Minimal)

-   **Expo**: Mobile development framework
-   **React Native**: Cross-platform development
-   **TypeScript**: Type-safe development

### File Structure

```
DataSovMobile/
├── App.tsx          # Main application
├── index.js         # Entry point
├── app.json         # Expo configuration
├── package.json     # Dependencies
└── assets/          # Image resources
```

## 🚀 Setup

### Prerequisites

-   Node.js 18+
-   Expo CLI
-   iOS Simulator or Android Emulator
-   Physical device (for testing)

### Installation

1. **Install dependencies**

    ```bash
    npm install
    ```

2. **Start development server**

    ```bash
    npm start
    ```

3. **Run on device/simulator**
    ```bash
    npm run ios     # iOS Simulator
    npm run android # Android Emulator
    ```

## 📊 Data Collection

### Supported Data Types

-   **Location Data**: GPS coordinates and timestamps
-   **App Usage**: App names and usage time
-   **Health Data**: Steps, heart rate, sleep patterns
-   **Purchase History**: Store names, amounts, categories

### Privacy

-   Users can individually control data collection
-   Collected data is anonymized
-   Easy opt-out functionality

## 💰 Revenue Management

### Revenue Display

-   Today's earnings
-   Weekly earnings
-   Monthly earnings
-   Total earnings

### Goal Management

-   Monthly goal setting
-   Progress rate display
-   Earnings history review

## 🎨 UI/UX

### Design Principles

-   **Simple**: Minimal necessary features
-   **Intuitive**: Easy-to-understand navigation
-   **Responsive**: Support for various screen sizes
-   **Accessible**: User-friendly interface

### Color Palette

-   Primary: #3B82F6 (Blue)
-   Success: #10B981 (Green)
-   Error: #EF4444 (Red)
-   Text: #1F2937 (Dark Gray)
-   Background: #F8FAFC (Light Gray)

## 🔧 Configuration

### Environment Variables

Create a `.env` file (optional):

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_ENVIRONMENT=development
```

### Customization

-   Revenue goal changes
-   Data collection frequency adjustment
-   UI theme settings

## 📈 Performance

### Optimization

-   Minimal dependencies
-   Lightweight UI components
-   Efficient state management
-   Fast startup time

### File Size

-   Lightweight version: ~2MB
-   Original version: ~15MB
-   Reduction rate: ~87%

## 🧪 Testing

### Testing Methods

1. **Expo Go**: Scan QR code
2. **Simulator**: iOS/Android emulator
3. **Physical Device**: Actual smartphone

### Test Items

-   Screen navigation
-   Data collection settings
-   Revenue display
-   Settings changes

## 🚀 Deployment

### Development

```bash
npm run build:dev
```

### Production

```bash
npm run build:prod
```

### App Store Distribution

1. Build with Expo Build Service
2. Upload to App Store Connect
3. Review and release

## 🔮 Future Plans

### Planned Additional Features

-   [ ] Push notifications
-   [ ] Offline support
-   [ ] Data visualization
-   [ ] Social features
-   [ ] Multi-language support

### Technical Improvements

-   [ ] Performance optimization
-   [ ] Security enhancement
-   [ ] Accessibility improvement
-   [ ] Test coverage expansion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

-   Email: support@datasov.com
-   Documentation: https://docs.datasov.com
-   Issues: GitHub Issues

---

**DataSov Mobile (Lightweight Version)** - Simple and fast data monetization app
