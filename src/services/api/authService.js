// src/services/api/authService.js

import apiClient from './client';
import { config } from '../../constants/config';

const AUTH_ENDPOINT = config.API_ENDPOINTS.AUTH;

/**
 * Service gérant les appels API liés à l'authentification
 */
const authService = {
  /**
   * Inscrit un nouvel utilisateur
   * @param {Object} userData - Données d'inscription
   * @returns {Promise} - Résultat de la requête
   */
  register: (userData) => {
    return apiClient.post(`${AUTH_ENDPOINT}/register/`, userData);
  },

  /**
   * Connecte un utilisateur
   * @param {Object} credentials - Identifiants de connexion (email, password)
   * @returns {Promise} - Résultat de la requête avec tokens
   */
  login: (credentials) => {
    return apiClient.post(`${AUTH_ENDPOINT}/token/`, credentials);
  },

  /**
   * Rafraîchit le token d'authentification
   * @param {string} refreshToken - Token de rafraîchissement
   * @returns {Promise} - Résultat de la requête avec nouveau token
   */
  refreshToken: (refreshToken) => {
    return apiClient.post(`${AUTH_ENDPOINT}/token/refresh/`, {
      refresh: refreshToken
    });
  },

  /**
   * Demande un code de vérification pour un numéro de téléphone
   * @param {string} phoneNumber - Numéro de téléphone à vérifier
   * @returns {Promise} - Résultat de la requête
   */
  requestPhoneVerification: (phoneNumber) => {
    return apiClient.post(`${AUTH_ENDPOINT}/verify-phone/`, {
      phone_number: phoneNumber
    });
  },

  /**
   * Vérifie un code reçu par SMS
   * @param {Object} data - Données de vérification (phone_number, code)
   * @returns {Promise} - Résultat de la requête
   */
  verifyPhoneCode: (data) => {
    return apiClient.post(`${AUTH_ENDPOINT}/verify-code/`, data);
  },

  /**
   * Connecte l'utilisateur via un réseau social
   * @param {Object} data - Données d'authentification sociale
   * @returns {Promise} - Résultat de la requête
   */
  socialAuth: (data) => {
    return apiClient.post(`${AUTH_ENDPOINT}/social-auth/`, data);
  },

  /**
   * Récupère le statut de vérification de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getVerificationStatus: () => {
    return apiClient.get(`${AUTH_ENDPOINT}/verification-status/`);
  },

  /**
   * Change le mot de passe de l'utilisateur
   * @param {Object} data - Données de changement de mot de passe
   * @returns {Promise} - Résultat de la requête
   */
  changePassword: (data) => {
    return apiClient.post(`${AUTH_ENDPOINT}/users/me/change_password/`, data);
  }
};

export default authService;