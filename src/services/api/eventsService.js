// src/services/api/eventsService.js

import apiClient from './client';
import { config } from '../../constants/config';

const EVENTS_ENDPOINT = config.API_ENDPOINTS.EVENTS;

/**
 * Service gérant les appels API liés aux événements
 */
const eventsService = {
  /**
   * Récupère les catégories d'événements
   * @returns {Promise} - Résultat de la requête
   */
  getCategories: () => {
    return apiClient.get(`${EVENTS_ENDPOINT}/categories/`);
  },

  /**
   * Récupère tous les événements avec filtres optionnels
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise} - Résultat de la requête
   */
  getEvents: (params = {}) => {
    return apiClient.get(`${EVENTS_ENDPOINT}/events/`, { params });
  },

  /**
   * Récupère les détails d'un événement spécifique
   * @param {number} eventId - ID de l'événement
   * @returns {Promise} - Résultat de la requête
   */
  getEventDetails: (eventId) => {
    return apiClient.get(`${EVENTS_ENDPOINT}/events/${eventId}/`);
  },

  /**
   * Récupère les événements à venir
   * @returns {Promise} - Résultat de la requête
   */
  getUpcomingEvents: () => {
    return apiClient.get(`${EVENTS_ENDPOINT}/upcoming/`);
  },

  /**
   * Récupère les événements populaires
   * @returns {Promise} - Résultat de la requête
   */
  getPopularEvents: () => {
    return apiClient.get(`${EVENTS_ENDPOINT}/popular/`);
  },

  /**
   * Récupère les événements auxquels l'utilisateur participe
   * @returns {Promise} - Résultat de la requête
   */
  getMyEvents: () => {
    return apiClient.get(`${EVENTS_ENDPOINT}/my-events/`);
  },

  /**
   * S'inscrit à un événement
   * @param {Object} registrationData - Données d'inscription (event)
   * @returns {Promise} - Résultat de la requête
   */
  registerForEvent: (registrationData) => {
    return apiClient.post(`${EVENTS_ENDPOINT}/participants/register/`, registrationData);
  },

  /**
   * Annule sa participation à un événement
   * @param {number} participantId - ID de participation
   * @returns {Promise} - Résultat de la requête
   */
  cancelRegistration: (participantId) => {
    return apiClient.post(`${EVENTS_ENDPOINT}/participants/${participantId}/cancel_registration/`);
  },

  /**
   * Ajoute un commentaire à un événement
   * @param {Object} commentData - Données du commentaire
   * @returns {Promise} - Résultat de la requête
   */
  addComment: (commentData) => {
    return apiClient.post(`${EVENTS_ENDPOINT}/comments/`, commentData);
  },

  /**
   * Récupère les commentaires d'un événement
   * @param {number} eventId - ID de l'événement
   * @returns {Promise} - Résultat de la requête
   */
  getComments: (eventId) => {
    return apiClient.get(`${EVENTS_ENDPOINT}/comments/`, {
      params: { event: eventId }
    });
  },

  /**
   * Sauvegarde ou supprime un événement des favoris
   * @param {Object} saveData - Données pour sauvegarder (event)
   * @returns {Promise} - Résultat de la requête
   */
  toggleSaveEvent: (saveData) => {
    return apiClient.post(`${EVENTS_ENDPOINT}/saved/toggle_save/`, saveData);
  },

  /**
   * Récupère les événements sauvegardés
   * @returns {Promise} - Résultat de la requête
   */
  getSavedEvents: () => {
    return apiClient.get(`${EVENTS_ENDPOINT}/saved/`);
  }
};

export default eventsService;