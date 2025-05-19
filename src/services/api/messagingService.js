// src/services/api/messagingService.js

import apiClient from './client';
import { config } from '../../constants/config';

const MESSAGING_ENDPOINT = config.API_ENDPOINTS.MESSAGING;

/**
 * Service gérant les appels API liés à la messagerie
 */
const messagingService = {
  /**
   * Récupère toutes les conversations de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getConversations: () => {
    return apiClient.get(`${MESSAGING_ENDPOINT}/conversations/`);
  },

  /**
   * Récupère les conversations actives
   * @returns {Promise} - Résultat de la requête
   */
  getActiveConversations: () => {
    return apiClient.get(`${MESSAGING_ENDPOINT}/conversations/active/`);
  },

  /**
   * Crée une nouvelle conversation
   * @param {Object} conversationData - Données de la conversation
   * @returns {Promise} - Résultat de la requête
   */
  createConversation: (conversationData) => {
    return apiClient.post(`${MESSAGING_ENDPOINT}/create-conversation/`, conversationData);
  },

  /**
   * Récupère ou crée une conversation avec un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getConversationWithUser: (userId) => {
    return apiClient.get(`${MESSAGING_ENDPOINT}/conversation-with-user/${userId}/`);
  },

  /**
   * Désactive une conversation
   * @param {number} conversationId - ID de la conversation
   * @returns {Promise} - Résultat de la requête
   */
  deactivateConversation: (conversationId) => {
    return apiClient.post(`${MESSAGING_ENDPOINT}/conversations/${conversationId}/deactivate/`);
  },

  /**
   * Récupère les messages d'une conversation
   * @param {number} conversationId - ID de la conversation
   * @returns {Promise} - Résultat de la requête
   */
  getMessages: (conversationId) => {
    return apiClient.get(`${MESSAGING_ENDPOINT}/messages/`, {
      params: { conversation_id: conversationId }
    });
  },

  /**
   * Envoie un nouveau message
   * @param {Object} messageData - Données du message
   * @returns {Promise} - Résultat de la requête
   */
  sendMessage: (messageData) => {
    return apiClient.post(`${MESSAGING_ENDPOINT}/messages/`, messageData);
  },

  /**
   * Marque un message comme lu
   * @param {number} messageId - ID du message
   * @returns {Promise} - Résultat de la requête
   */
  markMessageAsRead: (messageId) => {
    return apiClient.post(`${MESSAGING_ENDPOINT}/messages/${messageId}/mark_as_read/`);
  },

  /**
   * Supprime un message pour l'utilisateur courant
   * @param {number} messageId - ID du message
   * @returns {Promise} - Résultat de la requête
   */
  deleteMessage: (messageId) => {
    return apiClient.post(`${MESSAGING_ENDPOINT}/messages/${messageId}/delete_for_me/`);
  },

  /**
   * Récupère le nombre de messages non lus
   * @returns {Promise} - Résultat de la requête
   */
  getUnreadCount: () => {
    return apiClient.get(`${MESSAGING_ENDPOINT}/unread-count/`);
  }
};

export default messagingService;
