# Backend-Mobile Integration Guide

## Overview
This guide explains how to integrate the Spring Boot backend with the Ionic mobile app.

## Architecture
```
Mobile App (Ionic/Vue) 
    ↓ (Firebase Auth + HTTP)
Spring Boot Backend
    ↓
PostgreSQL Database
    ↔ (Sync)
Firebase Firestore
```

## Setup Steps

### 1. Backend Setup

#### Start the Backend Server
```bash
cd lalana
./gradlew bootRun
```

The backend will run on `http://localhost:8080`

#### Verify Backend is Running
```bash
curl http://localhost:8080/api/signalements
```

### 2. Mobile App Configuration

#### Install Dependencies
```bash
cd mobile/lalana-app
npm install
```

#### Configure Environment Variables
Edit `.env.local` file:
```env
VITE_API_URL=http://localhost:8080
```

For Android emulator, use:
```env
VITE_API_URL=http://10.0.2.2:8080
```

For iOS simulator, use:
```env
VITE_API_URL=http://localhost:8080
```

For physical device on same network:
```env
VITE_API_URL=http://YOUR_COMPUTER_IP:8080
```

#### Start Mobile App
```bash
# Web development
npm run dev

# Android
npm run android

# iOS
npm run ios
```

### 3. Data Source Configuration

The app supports three data source modes:

#### 1. **Backend Mode** (PostgreSQL via API)
```typescript
import { signalementDataService } from '@/services/signalement-data.service';
signalementDataService.setDataSource('backend');
```

#### 2. **Firebase Mode** (Direct Firestore)
```typescript
signalementDataService.setDataSource('firebase');
```

#### 3. **Hybrid Mode** (Backend with Firebase fallback) - RECOMMENDED
```typescript
signalementDataService.setDataSource('hybrid');
```

### 4. API Endpoints

#### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify` - Verify Firebase token

#### Signalements
- `GET /api/signalements` - Get all signalements
- `GET /api/signalements/{id}` - Get signalement by ID
- `GET /api/signalements/user` - Get user's signalements
- `POST /api/signalements` - Create signalement
- `PUT /api/signalements/{id}/status` - Update status
- `DELETE /api/signalements/{id}` - Delete signalement

#### Problemes
- `GET /api/problemes` - Get all problemes
- `GET /api/problemes/{id}` - Get probleme by ID
- `POST /api/problemes` - Create probleme
- `PUT /api/problemes/{id}` - Update probleme
- `DELETE /api/problemes/{id}` - Delete probleme

#### Sync
- `POST /api/sync/firestore-to-postgres` - Sync Firestore → PostgreSQL
- `POST /api/sync/postgres-to-firestore` - Sync PostgreSQL → Firestore
- `POST /api/sync/bidirectional` - Full bidirectional sync

### 5. Authentication Flow

1. **User logs in via Firebase Auth** (mobile app)
2. **Firebase returns ID token**
3. **Mobile app includes token in API requests**
4. **Backend validates token** and identifies user
5. **Backend returns data** from PostgreSQL

### 6. Using the API Services

#### Example: Fetch Signalements
```typescript
import { signalementDataService } from '@/services/signalement-data.service';

// Get all signalements
const signalements = await signalementDataService.getAll();

// Get user's signalements
const mySignalements = await signalementDataService.getUserSignalements();

// Create new signalement
const id = await signalementDataService.create({
  id: null,
  userId: 'user-id',
  x: 47.5,
  y: -18.9,
  localisation: 'Antananarivo',
  description: 'Route endommagée',
  statusLibelle: 'En attente',
  createdAt: new Date().toISOString()
});
```

#### Example: Real-time Updates
```typescript
// Subscribe to updates (uses Firebase for real-time, or polling for backend)
const unsubscribe = signalementDataService.subscribeToSignalements((signalements) => {
  console.log('Updated signalements:', signalements);
});

// Cleanup
unsubscribe();
```

### 7. Troubleshooting

#### CORS Errors
- Ensure backend CORS config includes your mobile app URLs
- Check [CorsConfig.java](../src/main/java/com/projet/lalana/config/CorsConfig.java)

#### Connection Refused
- **Android Emulator**: Use `10.0.2.2` instead of `localhost`
- **Physical Device**: Use your computer's IP address
- **iOS Simulator**: Use `localhost` or `127.0.0.1`
- Ensure backend is running on port 8080

#### Authentication Errors
- Verify Firebase token is being sent in Authorization header
- Check backend logs for token validation errors
- Ensure Firebase API key is configured in backend `application.properties`

#### Network Security (Android)
If using HTTP (not HTTPS) on Android 9+, add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application android:usesCleartextTraffic="true">
```

### 8. Production Deployment

#### Backend
1. Update CORS to include production URLs
2. Use HTTPS
3. Configure proper database credentials
4. Set Firebase API key from environment variable

#### Mobile App
1. Update `.env.production` with production API URL
2. Build app: `npm run build`
3. Deploy to app stores

#### Environment Variables
```env
# .env.production
VITE_API_URL=https://api.yourapp.com
```

### 9. Sync Strategy

For offline-first capabilities:

1. **Write to Firebase** (instant, works offline)
2. **Sync to PostgreSQL** (when online)
3. **Read from PostgreSQL** (via backend API)

This ensures:
- ✅ Works offline
- ✅ Real-time updates
- ✅ Centralized data in PostgreSQL
- ✅ Firebase as offline cache

### 10. Testing

#### Test Backend API
```bash
# Get signalements
curl http://localhost:8080/api/signalements

# Create signalement (with auth token)
curl -X POST http://localhost:8080/api/signalements \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "x": 47.5,
    "y": -18.9,
    "localisation": "Antananarivo",
    "description": "Test",
    "statusLibelle": "En attente"
  }'
```

#### Test Mobile App
1. Start backend: `./gradlew bootRun`
2. Start mobile app: `npm run dev`
3. Login with test user
4. Create a signalement
5. Verify it appears in PostgreSQL database

## Next Steps

1. ✅ Backend is running
2. ✅ Mobile app configured
3. ✅ API services created
4. ✅ CORS configured
5. 🔄 Test authentication flow
6. 🔄 Test CRUD operations
7. 🔄 Test sync functionality
8. 🔄 Deploy to production

## Support

For issues, check:
- Backend logs
- Browser console (for web)
- Chrome DevTools for mobile debugging
- Network tab for API calls
