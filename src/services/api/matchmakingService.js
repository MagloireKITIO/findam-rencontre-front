// src/services/api/matchmakingService.js

import apiClient from './client';
import { config } from '../../constants/config';

const MATCHMAKING_ENDPOINT = config.API_ENDPOINTS.MATCHMAKING;

/**
 * Service gérant les appels API liés au matchmaking
 */
const matchmakingService = {
  /**
   * Récupère les profils pour la découverte (swipe)
   * @returns {Promise} - Résultat de la requête
   */
  getDiscoveryProfiles: () => {
    return apiClient.get(`${MATCHMAKING_ENDPOINT}/discover/`);
  },

  /**
   * Récupère les utilisateurs à proximité
   * @param {Object} params - Paramètres de recherche (distance, etc.)
   * @returns {Promise} - Résultat de la requête
   */
  getNearbyUsers: (params = {}) => {
    return apiClient.get(`${MATCHMAKING_ENDPOINT}/nearby/`, { params });
  },

  /**
   * Récupère les préférences de matchmaking de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getUserPreferences: () => {
    return apiClient.get(`${MATCHMAKING_ENDPOINT}/preferences/`);
  },

  /**
   * Met à jour les préférences de matchmaking
   * @param {Object} preferences - Nouvelles préférences
   * @returns {Promise} - Résultat de la requête
   */
  updateUserPreferences: (preferences) => {
    return apiClient.put(`${MATCHMAKING_ENDPOINT}/preferences/`, preferences);
  },

  /**
   * Enregistre une action de swipe
   * @param {Object} swipeData - Données du swipe (target, action)
   * @returns {Promise} - Résultat de la requête
   */
  swipe: (swipeData) => {
    return apiClient.post(`${MATCHMAKING_ENDPOINT}/swipes/`, swipeData);
  },

  /**
   * Aime un utilisateur
   * @param {Object} likeData - Données du like (liked)
   * @returns {Promise} - Résultat de la requête
   */
  likeUser: (likeData) => {
    return apiClient.post(`${MATCHMAKING_ENDPOINT}/likes/`, likeData);
  },

  /**
   * Dislike un utilisateur
   * @param {Object} dislikeData - Données du dislike (disliked)
   * @returns {Promise} - Résultat de la requête
   */
  dislikeUser: (dislikeData) => {
    return apiClient.post(`${MATCHMAKING_ENDPOINT}/dislikes/`, dislikeData);
  },

  /**
   * Récupère tous les matchs de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getMatches: () => {
    return apiClient.get(`${MATCHMAKING_ENDPOINT}/matches/`);
  },

  /**
   * Supprime un match
   * @param {number} matchId - ID du match à supprimer
   * @returns {Promise} - Résultat de la requête
   */
  unmatch: (matchId) => {
    return apiClient.post(`${MATCHMAKING_ENDPOINT}/matches/${matchId}/unmatch/`);
  },

  /**
   * Bloque un utilisateur
   * @param {Object} blockData - Données du blocage (blocked, reason)
   * @returns {Promise} - Résultat de la requête
   */
  blockUser: (blockData) => {
    return apiClient.post(`${MATCHMAKING_ENDPOINT}/blocks/`, blockData);
  },

  /**
   * Signale un utilisateur
   * @param {Object} reportData - Données du signalement
   * @returns {Promise} - Résultat de la requête
   */
  reportUser: (reportData) => {
    return apiClient
      .post(`${MATCHMAKING_ENDPOINT}/reports/`, reportData);
  },

  /**
   * Récupère les statistiques de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getUserStats: () => {
    return apiClient.get(`${MATCHMAKING_ENDPOINT}/stats/`);
  }
};

export default matchmakingService;