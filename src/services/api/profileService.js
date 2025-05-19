// src/services/api/profileService.js

import apiClient from './client';
import { config } from '../../constants/config';

const PROFILE_ENDPOINT = config.API_ENDPOINTS.PROFILE;

/**
 * Service gérant les appels API liés aux profils utilisateurs
 */
const profileService = {
  /**
   * Récupère le profil de l'utilisateur connecté
   * @returns {Promise} - Résultat de la requête
   */
  getMyProfile: () => {
    return apiClient.get(`${PROFILE_ENDPOINT}/users/me/`);
  },

  /**
   * Met à jour le profil de l'utilisateur connecté
   * @param {Object} profileData - Données du profil à mettre à jour
   * @returns {Promise} - Résultat de la requête
   */
  updateProfile: (profileData) => {
    return apiClient.put(`${PROFILE_ENDPOINT}/users/me/`, profileData);
  },

  /**
   * Récupère le profil d'un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getUserProfile: (userId) => {
    return apiClient.get(`${PROFILE_ENDPOINT}/users/${userId}/`);
  },

  /**
   * Met à jour la localisation de l'utilisateur
   * @param {Object} locationData - Données de localisation (latitude, longitude)
   * @returns {Promise} - Résultat de la requête
   */
  updateLocation: (locationData) => {
    return apiClient.post(`${PROFILE_ENDPOINT}/users/me/update_location/`, locationData);
  },

  /**
   * Ajoute une photo au profil
   * @param {FormData} formData - Données de formulaire avec l'image
   * @returns {Promise} - Résultat de la requête
   */
  addPhoto: (formData) => {
    return apiClient.post(`${PROFILE_ENDPOINT}/photos/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Supprime une photo du profil
   * @param {number} photoId - ID de la photo à supprimer
   * @returns {Promise} - Résultat de la requête
   */
  deletePhoto: (photoId) => {
    return apiClient.delete(`${PROFILE_ENDPOINT}/photos/${photoId}/`);
  },

  /**
   * Définit une photo comme photo principale
   * @param {number} photoId - ID de la photo
   * @returns {Promise} - Résultat de la requête
   */
  setPrimaryPhoto: (photoId) => {
    return apiClient.post(`${PROFILE_ENDPOINT}/photos/${photoId}/set_primary/`);
  }
};

export default profileService;