// src/constants/config.js

/**
 * Configuration globale de l'application
 */
export const config = {
  // URL de base de l'API
  API_URL: 'http://192.168.6.56:8000', // Utilise 10.0.2.2 pour accéder à localhost depuis un émulateur Android
  // API_URL: 'http://localhost:8000', // Pour iOS Simulator
  // API_URL: 'https://findam.cm', // Pour la production

  // Timeout des requêtes API (en ms)
  API_TIMEOUT: 10000,

  // Préfixes API
  API_ENDPOINTS: {
    AUTH: '/api/accounts',
    PROFILE: '/api/accounts',
    MATCHMAKING: '/api/matchmaking',
    MESSAGING: '/api/messaging',
    EVENTS: '/api/events',
    SUBSCRIPTIONS: '/api/subscriptions',
    NOTIFICATIONS: '/api/notifications',
  },

  // Configuration des WebSockets
  WEBSOCKET_URL: 'ws://192.168.6.56:8000', // Pour émulateur Android
  // WEBSOCKET_URL: 'ws://localhost:8000', // Pour iOS Simulator
  // WEBSOCKET_URL: 'wss://findam.cm', // Pour la production
  
  WEBSOCKET_PATHS: {
    CHAT: '/ws/chat/',
    NOTIFICATIONS: '/ws/notifications/'
  },

  // Clés de stockage local
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    NOTIFICATION_SETTINGS: 'notification_settings'
  },

  // Paramètres par défaut
  DEFAULT_DISTANCE_RADIUS: 50, // km
  DEFAULT_AGE_RANGE: { min: 18, max: 50 },
};