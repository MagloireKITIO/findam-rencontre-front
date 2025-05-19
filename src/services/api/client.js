// src/services/api/client.js

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '../../constants/config';

/**
 * Client Axios configuré pour communiquer avec le backend
 */
const apiClient = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Récupérer le token depuis le stockage sécurisé
      const token = await SecureStore.getItemAsync('auth_token');
      
      // Si un token existe, l'ajouter aux headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et les erreurs
apiClient.interceptors.response.use(
  (response) => {
    // Traitement des réponses réussies
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est due à un token expiré (401) et qu'on n'a pas déjà essayé de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Essayer de rafraîchir le token
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        
        if (refreshToken) {
          const response = await axios.post(`${config.API_URL}${config.API_ENDPOINTS.AUTH}/token/refresh/`, {
            refresh: refreshToken
          });
          
          // Si le rafraîchissement réussit, mettre à jour les tokens
          if (response.data.access) {
            await SecureStore.setItemAsync('auth_token', response.data.access);
            
            // Mettre à jour le header et réessayer la requête
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement du token:', refreshError);
        
        // Si le rafraîchissement échoue, rediriger vers la connexion
        // (cette logique sera implémentée via un context/hook d'authentification)
      }
    }
    
    // Gestion des erreurs réseau
    if (!error.response) {
      console.error('Erreur réseau:', error.message);
      // On pourrait ici gérer le mode hors ligne
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;