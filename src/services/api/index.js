// src/services/api/index.js

import authService from './authService';
import profileService from './profileService';
import matchmakingService from './matchmakingService';
import messagingService from './messagingService';
import eventsService from './eventsService';
import notificationsService from './notificationsService';
import subscriptionsService from './subscriptionsService';

/**
 * Export de tous les services API de l'application
 */
const apiServices = {
  auth: authService,
  profile: profileService,
  matchmaking: matchmakingService,
  messaging: messagingService,
  events: eventsService,
  notifications: notificationsService,
  subscriptions: subscriptionsService
};

export default apiServices;