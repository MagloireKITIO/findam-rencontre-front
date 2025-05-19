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
    // Créer une copie des données pour ne pas modifier l'original
    const formattedData = { ...profileData };
    
    // Formater la date de naissance si c'est un objet Date
    if (formattedData.date_of_birth instanceof Date) {
      formattedData.date_of_birth = formattedData.date_of_birth.toISOString().split('T')[0];
    }
    
    // Nettoyer les valeurs booléennes potentiellement problématiques
    if (formattedData.profile) {
      // Convertir explicitement has_children en vrai booléen si défini
      if (formattedData.profile.has_children !== null && formattedData.profile.has_children !== undefined) {
        formattedData.profile.has_children = Boolean(formattedData.profile.has_children);
      }
    }
    
    console.log('Données formatées pour mise à jour:', formattedData);
    
    // Utiliser PATCH au lieu de PUT pour mise à jour partielle
    return apiClient.patch(`${PROFILE_ENDPOINT}/users/me/`, formattedData);
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
    return apiClient.post(`${PROFILE_ENDPOINT}/users/update_location/`, locationData);
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
  },
  
  /**
   * Change le mot de passe de l'utilisateur
   * @param {Object} passwordData - Données de changement de mot de passe
   * @returns {Promise} - Résultat de la requête
   */
  changePassword: (passwordData) => {
    return apiClient.post(`${PROFILE_ENDPOINT}/change_password/`, passwordData);
  },
  
  /**
   * Supprime le compte de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  deleteAccount: () => {
    return apiClient.delete(`${PROFILE_ENDPOINT}/delete_account/`);
  },
  
  /**
   * Vérifie le statut de vérification du téléphone de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getVerificationStatus: () => {
    return apiClient.get(`${PROFILE_ENDPOINT}/verification-status/`);
  }
};

export default profileService;