// src/services/api/notificationsService.js

import apiClient from './client';
import { config } from '../../constants/config';

const NOTIFICATIONS_ENDPOINT = config.API_ENDPOINTS.NOTIFICATIONS;

/**
 * Service gérant les appels API liés aux notifications
 */
const notificationsService = {
  /**
   * Récupère toutes les notifications de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getNotifications: () => {
    return apiClient.get(`${NOTIFICATIONS_ENDPOINT}/notifications/`);
  },

  /**
   * Récupère les notifications non lues
   * @returns {Promise} - Résultat de la requête
   */
  getUnreadNotifications: () => {
    return apiClient.get(`${NOTIFICATIONS_ENDPOINT}/notifications/unread/`);
  },

  /**
   * Marque une notification comme lue
   * @param {number} notificationId - ID de la notification
   * @returns {Promise} - Résultat de la requête
   */
  markAsRead: (notificationId) => {
    return apiClient.post(`${NOTIFICATIONS_ENDPOINT}/notifications/${notificationId}/mark_as_read/`);
  },

  /**
   * Marque toutes les notifications comme lues
   * @returns {Promise} - Résultat de la requête
   */
  markAllAsRead: () => {
    return apiClient.post(`${NOTIFICATIONS_ENDPOINT}/notifications/mark_all_as_read/`);
  },

  /**
   * Récupère les préférences de notification
   * @returns {Promise} - Résultat de la requête
   */
  getNotificationPreferences: () => {
    return apiClient.get(`${NOTIFICATIONS_ENDPOINT}/preferences/`);
  },

  /**
   * Met à jour les préférences de notification
   * @param {Object} preferences - Nouvelles préférences
   * @returns {Promise} - Résultat de la requête
   */
  updateNotificationPreferences: (preferences) => {
    return apiClient.put(`${NOTIFICATIONS_ENDPOINT}/preferences/`, preferences);
  },

  /**
   * Enregistre un appareil pour les notifications push
   * @param {Object} deviceData - Données de l'appareil
   * @returns {Promise} - Résultat de la requête
   */
  registerDevice: (deviceData) => {
    return apiClient.post(`${NOTIFICATIONS_ENDPOINT}/register-device/`, deviceData);
  },

  /**
   * Désactive un appareil pour les notifications push
   * @param {Object} tokenData - Données du token
   * @returns {Promise} - Résultat de la requête
   */
  unregisterDevice: (tokenData) => {
    return apiClient.post(`${NOTIFICATIONS_ENDPOINT}/unregister-device/`, tokenData);
  },

  /**
   * Récupère le nombre de notifications non lues
   * @returns {Promise} - Résultat de la requête
   */
  getNotificationCount: () => {
    return apiClient.get(`${NOTIFICATIONS_ENDPOINT}/count/`);
  },

  /**
   * Envoie une notification de test
   * @returns {Promise} - Résultat de la requête
   */
  sendTestNotification: () => {
    return apiClient.post(`${NOTIFICATIONS_ENDPOINT}/test/`);
  }
};

export default notificationsService;