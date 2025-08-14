# 🎵 SpotifyClone - Music Streaming Platform

A modern music streaming application built with Angular 20, similar to Spotify but powered by SoundCloud API. Stream music without platform ads, create playlists, follow users, and enjoy a seamless audio experience.

## 🌟 Features Overview

### Core Features
- 🎧 **Music Streaming** - Stream songs from SoundCloud API
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🚫 **Ad-Free Experience** - No platform advertisements
- ⚡ **Real-time Audio Controls** - Play, pause, skip, volume control
- 🔄 **Seamless Playback** - Continuous music experience

### User Features
- 👤 **User Authentication** - Login/Register/Profile management
- 📋 **Playlist Management** - Create, edit, delete personal playlists
- ❤️ **Favorites System** - Like/unlike songs and albums
- 👥 **Social Features** - Follow users, view their playlists
- 🔍 **Search & Discovery** - Find songs, artists, albums, users drdd
- 📚 **Music Library** - Personal collection management
- 🎵 **Recently Played** - Track listening history

### Advanced Features
- 🎯 **Smart Recommendations** - Based on listening habits
- 🌙 **Dark/Light Theme** - Theme switching
- 📊 **Music Analytics** - Personal listening statistics
- 🔄 **Queue Management** - Add/remove songs from queue
- 🎛️ **Equalizer** - Audio customization
- 💾 **Offline Mode** - Cache favorite songs (PWA)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Angular CLI (v20+)
- SoundCloud API Key
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/ccawaisnadeem/AngularProject.git
cd AngularProject

# Install dependencies
npm install

# Set up environment variables
cp src/environments/environment.example.ts src/environments/environment.ts
# Add your SoundCloud API keys

# Start development server
ng serve
```

Navigate to `http://localhost:4200/` - The app will auto-reload on file changes.

## 🔧 Development Setup

### Environment Configuration
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  soundcloudApiKey: 'YOUR_SOUNDCLOUD_CLIENT_ID',
  soundcloudApiSecret: 'YOUR_SOUNDCLOUD_CLIENT_SECRET',
  apiBaseUrl: 'https://api.soundcloud.com',
  firebaseConfig: {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

### Required Dependencies
```bash
# Install additional packages
npm install @angular/material @angular/cdk
npm install @angular/fire firebase
npm install rxjs
npm install howler  # Audio management
npm install @ngrx/store @ngrx/effects  # State management
npm install @angular/service-worker  # PWA support
npm install @angular/flex-layout  # Layout system
npm install chart.js ng2-charts  # Analytics charts
npm install ngx-infinite-scroll  # Infinite scrolling
npm install @angular/google-maps  # Optional: Concert locations
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Singleton services, guards
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── soundcloud-api.service.ts
│   │   │   ├── audio-player.service.ts
│   │   │   ├── user.service.ts
│   │   │   └── notification.service.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   └── admin.guard.ts
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── song.model.ts
│   │       └── playlist.model.ts
│   ├── shared/                  # Reusable components
│   │   ├── components/
│   │   │   ├── audio-player/
│   │   │   ├── song-card/
│   │   │   ├── playlist-card/
│   │   │   ├── search-bar/
│   │   │   ├── user-avatar/
│   │   │   ├── loading-spinner/
│   │   │   ├── confirm-dialog/
│   │   │   └── notification-toast/
│   │   ├── pipes/
│   │   │   ├── duration.pipe.ts
│   │   │   ├── search-highlight.pipe.ts
│   │   │   └── time-ago.pipe.ts
│   │   └── directives/
│   │       ├── lazy-load.directive.ts
│   │       └── click-outside.directive.ts
│   ├── features/                # Feature modules
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── profile/
│   │   ├── music/
│   │   │   ├── player/
│   │   │   ├── library/
│   │   │   ├── search/
│   │   │   ├── discover/
│   │   │   ├── genres/
│   │   │   ├── charts/
│   │   │   └── recently-played/
│   │   ├── playlists/
│   │   │   ├── playlist-list/
│   │   │   ├── playlist-detail/
│   │   │   ├── create-playlist/
│   │   │   └── playlist-settings/
│   │   ├── social/
│   │   │   ├── user-profile/
│   │   │   ├── followers/
│   │   │   ├── following/
│   │   │   ├── activity-feed/
│   │   │   └── user-search/
│   │   ├── dashboard/
│   │   │   ├── home/
│   │   │   ├── trending/
│   │   │   ├── new-releases/
│   │   │   └── recommendations/
│   │   └── admin/               # Admin features
│   │       ├── user-management/
│   │       ├── analytics/
│   │       └── content-moderation/
│   ├── layout/                  # App layout components
│   │   ├── header/
│   │   ├── sidebar/
│   │   ├── footer/
│   │   └── mini-player/
│   └── store/                   # NgRx state management
│       ├── actions/
│       │   ├── auth.actions.ts
│       │   ├── player.actions.ts
│       │   ├── music.actions.ts
│       │   └── playlist.actions.ts
│       ├── reducers/
│       │   ├── index.ts
│       │   ├── auth.reducer.ts
│       │   ├── player.reducer.ts
│       │   └── music.reducer.ts
│       ├── effects/
│       │   ├── auth.effects.ts
│       │   ├── player.effects.ts
│       │   └── music.effects.ts
│       └── selectors/
│           ├── auth.selectors.ts
│           ├── player.selectors.ts
│           └── music.selectors.ts
```

## 🎯 Development Roadmap

### Phase 1: Foundation & Setup (Week 1-2)
- [ ] **Project Setup**
  - [x] Initialize Angular 20 project
  - [ ] Configure Angular Material Design
  - [ ] Setup Firebase authentication
  - [ ] Integrate SoundCloud API
  - [ ] Configure NgRx state management
  - [ ] Setup routing with lazy loading
  - [ ] Implement error handling

- [ ] **Authentication System**
  - [ ] User registration/login forms
  - [ ] Firebase Auth integration
  - [ ] Protected routes with guards
  - [ ] User profile management
  - [ ] Password reset functionality

### Phase 2: Core Music Features (Week 3-4)
- [ ] **Audio Player**
  - [ ] Implement Howler.js audio service
  - [ ] Play/pause/stop controls
  - [ ] Volume and progress controls
  - [ ] Next/previous track functionality
  - [ ] Shuffle and repeat modes
  - [ ] Queue management system

- [ ] **Music Discovery**
  - [ ] SoundCloud API integration
  - [ ] Search functionality (songs/artists/users)
  - [ ] Browse by genres/categories
  - [ ] Trending and popular tracks
  - [ ] Song metadata display

### Phase 3: User Features (Week 5-6)
- [ ] **Playlist Management**
  - [ ] Create/edit/delete playlists
  - [ ] Add/remove songs from playlists
  - [ ] Playlist sharing functionality
  - [ ] Collaborative playlists
  - [ ] Import/export playlists

- [ ] **Personal Library**
  - [ ] Favorites/liked songs
  - [ ] Personal music collection
  - [ ] Recently played tracks
  - [ ] Listening history
  - [ ] Download for offline (PWA)

### Phase 4: Social Features (Week 7-8)
- [ ] **User Interaction**
  - [ ] Follow/unfollow users
  - [ ] User profiles with playlists
  - [ ] Activity feed
  - [ ] User search and discovery
  - [ ] Comments on tracks/playlists

- [ ] **Recommendations**
  - [ ] Based on listening history
  - [ ] Similar users suggestions
  - [ ] Genre-based recommendations
  - [ ] Trending in your network

### Phase 5: Advanced Features (Week 9-10)
- [ ] **Analytics & Insights**
  - [ ] Personal listening statistics
  - [ ] Most played tracks/artists
  - [ ] Listening time analytics
  - [ ] Music taste analysis
  - [ ] Year-end wrapped feature

- [ ] **PWA & Offline**
  - [ ] Service worker setup
  - [ ] Cache management
  - [ ] Offline playlist access
  - [ ] Background sync
  - [ ] Push notifications

### Phase 6: Polish & Deployment (Week 11-12)
- [ ] **UI/UX Enhancements**
  - [ ] Dark/light theme toggle
  - [ ] Responsive design optimization
  - [ ] Animations and transitions
  - [ ] Loading states
  - [ ] Error boundaries

- [ ] **Performance & Deployment**
  - [ ] Code splitting and lazy loading
  - [ ] Bundle size optimization
  - [ ] Performance testing
  - [ ] Production deployment
  - [ ] CI/CD pipeline setup

## 🏗️ Key Components Implementation

### 1. Audio Player Service
```typescript
@Injectable({ providedIn: 'root' })
export class AudioPlayerService {
  private howl: Howl | null = null;
  private currentTrack$ = new BehaviorSubject<Track | null>(null);
  private isPlaying$ = new BehaviorSubject<boolean>(false);
  private volume$ = new BehaviorSubject<number>(1);
  private progress$ = new BehaviorSubject<number>(0);
  private queue$ = new BehaviorSubject<Track[]>([]);
  private currentIndex$ = new BehaviorSubject<number>(0);

  // Methods: play(), pause(), stop(), next(), previous(), 
  // setVolume(), seek(), addToQueue(), shuffle(), repeat()
}
```

### 2. SoundCloud API Service
```typescript
@Injectable({ providedIn: 'root' })
export class SoundcloudApiService {
  private readonly apiUrl = 'https://api.soundcloud.com';
  private readonly clientId = environment.soundcloudApiKey;

  // Methods: searchTracks(), getTrack(), getUser(), 
  // getUserTracks(), getPlaylists(), resolveUrl()
}
```

### 3. User Roles & Permissions
```typescript
export enum UserRole {
  USER = 'user',
  PREMIUM = 'premium',
  ARTIST = 'artist',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  subscription?: SubscriptionType;
  preferences: UserPreferences;
  stats: UserStats;
}
```

## 🎨 UI/UX Guidelines

### Design System
```scss
// Color Palette
:root {
  // Primary Colors
  --primary-green: #1db954;
  --primary-dark: #1ed760;
  --primary-light: #1fdf64;

  // Background Colors
  --bg-primary: #121212;
  --bg-secondary: #181818;
  --bg-elevated: #282828;
  --bg-tinted: #2a2a2a;

  // Text Colors
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-muted: #6a6a6a;

  // Accent Colors
  --accent-red: #e22134;
  --accent-blue: #2e77d0;
  --accent-yellow: #ffa500;
}
```

### Component Library
- **Material Design Components** - Buttons, forms, dialogs
- **Custom Audio Controls** - Player, volume, progress bars
- **Card Layouts** - Songs, albums, playlists, users
- **Navigation** - Sidebar, bottom navigation (mobile)
- **Loading States** - Skeletons, spinners, progress indicators

## 🧪 Testing Strategy

### Unit Testing Setup
```bash
# Install testing dependencies
npm install --save-dev @angular/testing jasmine karma
npm install --save-dev @testing-library/angular
npm install --save-dev jest @types/jest

# Run tests
ng test
ng test --watch=false --browsers=ChromeHeadless
```

### Testing Checklist
- [ ] **Audio Player Tests**
  - Play/pause functionality
  - Volume control
  - Progress tracking
  - Queue management

- [ ] **API Integration Tests**
  - SoundCloud API calls
  - Error handling
  - Rate limiting
  - Data transformation

- [ ] **User Flow Tests**
  - Authentication flow
  - Playlist creation
  - Search functionality
  - Social features

### E2E Testing with Cypress
```bash
npm install --save-dev cypress
npx cypress open
```

## 📱 Progressive Web App (PWA)

### PWA Features Implementation
```bash
# Add PWA support
ng add @angular/pwa
```

### Offline Capabilities
- **Service Worker** - Cache app shell and assets
- **Background Sync** - Sync user actions when online
- **Push Notifications** - New music alerts
- **Add to Home Screen** - Native app-like experience
- **Offline Playlists** - Cache favorite songs

## 🔐 Security & Privacy

### Data Protection
- **User Data Encryption** - Sensitive information
- **API Key Security** - Environment variables
- **HTTPS Enforcement** - Secure connections
- **Content Security Policy** - XSS protection
- **Rate Limiting** - API abuse prevention

### Privacy Features
- **Privacy Settings** - Profile visibility, listening activity
- **Data Export** - GDPR compliance
- **Account Deletion** - Right to be forgotten
- **Anonymous Listening** - Private mode

## 🚀 Performance Optimization

### Implementation Checklist
- [ ] **Lazy Loading**
  - Feature modules
  - Images (intersection observer)
  - Audio preloading strategies

- [ ] **Bundle Optimization**
  - Tree shaking unused code
  - Code splitting by routes
  - Dynamic imports for heavy features

- [ ] **Runtime Performance**
  - OnPush change detection
  - Virtual scrolling for large lists
  - Service worker caching
  - Audio compression

- [ ] **Monitoring**
  - Core Web Vitals tracking
  - Error reporting (Sentry)
  - Analytics integration
  - Performance budgets

## 🚀 Deployment & DevOps

### Build Configuration
```bash
# Production build
ng build --configuration production

# Analyze bundle
npm install -g webpack-bundle-analyzer
ng build --stats-json
webpack-bundle-analyzer dist/angular-project/stats.json
```

### Deployment Platforms
1. **Netlify** (Recommended)
   - Automatic deployments from Git
   - Environment variable management
   - CDN and HTTPS included
   - Form handling for contact

2. **Vercel**
   - Serverless functions support
   - Preview deployments
   - Performance analytics
   - Edge network

3. **Firebase Hosting**
   - Google Cloud integration
   - Authentication included
   - Real-time database
   - Cloud functions

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
      - name: Build
        run: npm run build:prod
      - name: Deploy
        run: npm run deploy
```

## 📊 Analytics & Monitoring

### Key Metrics to Track
- **User Engagement**
  - Daily/Monthly active users
  - Session duration
  - Tracks played per session
  - User retention rates

- **Music Consumption**
  - Most played tracks/artists
  - Skip rates
  - Playlist creation rates
  - Search queries

- **Technical Performance**
  - Page load times
  - Audio streaming quality
  - Error rates
  - API response times

### Tools Integration
```typescript
// Google Analytics 4
npm install gtag

// Mixpanel for user analytics
npm install mixpanel-browser

// Sentry for error tracking
npm install @sentry/angular
```

## 🤝 Contributing

### Development Workflow
1. **Fork & Clone**
   ```bash
   git clone https://github.com/your-username/AngularProject.git
   cd AngularProject
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/awesome-feature
   ```

3. **Development Standards**
   - Follow Angular style guide
   - Write unit tests (minimum 80% coverage)
   - Use conventional commits
   - Update documentation

4. **Pull Request Process**
   - Create detailed PR description
   - Link related issues
   - Ensure CI passes
   - Request code review

### Code Standards
```typescript
// TypeScript strict mode
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true

// ESLint + Prettier configuration
// Husky pre-commit hooks
// Conventional commits
```

## 📚 Learning Resources

### Angular & TypeScript
- [Angular Documentation](https://angular.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [RxJS Learn](https://rxjs.dev/guide/overview)
- [NgRx Documentation](https://ngrx.io/docs)

### Audio & APIs
- [SoundCloud API Guide](https://developers.soundcloud.com/docs/api/guide)
- [Howler.js Documentation](https://howlerjs.com)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Design & UX
- [Angular Material](https://material.angular.io)
- [Spotify Design System](https://spotify.design)
- [Music App UI Patterns](https://ui-patterns.com)

## 🎵 API Integration Guide

### SoundCloud API Setup
1. **Register Application**
   - Go to [SoundCloud Developers](https://developers.soundcloud.com)
   - Create new application
   - Get Client ID and Client Secret

2. **Rate Limits**
   - 15,000 requests per hour
   - Implement caching strategy
   - Use request queuing

3. **Available Endpoints**
   ```typescript
   // Search tracks
   GET /tracks?q={query}&client_id={client_id}
   
   // Get track details
   GET /tracks/{id}?client_id={client_id}
   
   // Get user info
   GET /users/{id}?client_id={client_id}
   
   // Get user's tracks
   GET /users/{id}/tracks?client_id={client_id}
   ```

## 🏆 Project Milestones

### MVP (Minimum Viable Product) - 4 weeks
- ✅ User authentication
- ✅ Music search and playback
- ✅ Basic playlist functionality
- ✅ Responsive design

### Version 1.0 - 8 weeks
- ✅ Full feature set
- ✅ Social features
- ✅ PWA capabilities
- ✅ Performance optimization

### Version 2.0 - 12 weeks
- ✅ Advanced analytics
- ✅ AI recommendations
- ✅ Artist features
- ✅ Premium subscriptions

---

## 🎯 Getting Started Checklist

### Day 1-2: Project Setup
- [ ] Clone repository and install dependencies
- [ ] Set up development environment
- [ ] Configure SoundCloud API credentials
- [ ] Create Firebase project for authentication
- [ ] Set up Angular Material theme

### Day 3-5: Authentication
- [ ] Implement login/register components
- [ ] Set up Firebase Auth
- [ ] Create auth guard for protected routes
- [ ] Build user profile component

### Day 6-10: Core Player
- [ ] Integrate Howler.js for audio playback
- [ ] Build audio controls component
- [ ] Implement play/pause/skip functionality
- [ ] Create progress bar and volume control

### Week 2: Music Features
- [ ] SoundCloud API integration
- [ ] Search functionality
- [ ] Song cards and music library
- [ ] Basic queue management

### Week 3-4: Playlists & Social
- [ ] Playlist CRUD operations
- [ ] User following system
- [ ] Activity feeds
- [ ] Social sharing features

**🚀 Ready to build your Spotify clone? Let's make some music!**

---

## 📞 Support & Community

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Share ideas and get help
- **Wiki**: Detailed technical documentation
- **Discord**: Real-time community chat

**Project Status**: 🚧 Active Development  
**Version**: 1.0.0-beta  
**License**: MIT  
**Maintainer**: [@ccawaisnadeem](https://github.com/ccawaisnadeem)