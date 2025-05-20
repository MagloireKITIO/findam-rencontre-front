// src/contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiServices from '../services/api';

// Création du contexte d'authentification
const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  return useContext(AuthContext);
};

// Fournisseur du contexte d'authentification
export const AuthProvider = ({ children }) => {
  // États pour gérer l'utilisateur et le chargement
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effet pour charger l'utilisateur au démarrage
  useEffect(() => {
    loadUser();
  }, []);

  // Charger l'utilisateur à partir du stockage local
  const loadUser = async () => {
    setLoading(true);
    try {
      console.log('Début du chargement de l\'utilisateur');
      // Récupérer le token et les données utilisateur
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');

      console.log('Token récupéré:', token ? 'Présent' : 'Absent');
      console.log('Données utilisateur récupérées:', userData ? 'Présentes' : 'Absentes');

      if (token && userData) {
        try {
          // Si les données existent, définir l'utilisateur
          const parsedUserData = JSON.parse(userData);
          console.log('Données utilisateur parsées avec succès');
          setUser(parsedUserData);
        } catch (parseError) {
          console.error('Erreur lors du parsing des données utilisateur:', parseError);
          console.error('Contenu de userData:', userData);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      console.error('Message d\'erreur:', error.message);
    } finally {
      console.log('Fin du chargement de l\'utilisateur');
      setLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (credentials) => {
  setLoading(true);
  console.log('Tentative de connexion avec:', JSON.stringify(credentials));
  try {
    // Appeler l'API de connexion
    console.log('Appel de l\'API de connexion');
    const response = await apiServices.auth.login(credentials);
    
    console.log('Réponse de l\'API reçue avec status:', response.status);
    console.log('Données de réponse:', response.data ? 'Présentes' : 'Absentes');
    
    // Vérifier si tous les éléments requis sont présents
    const hasAccess = !!response.data?.access;
    const hasRefresh = !!response.data?.refresh;
    const hasUser = !!response.data?.user;
    
    console.log(`Données manquantes dans la réponse: {"access": ${hasAccess}, "refresh": ${hasRefresh}, "user": ${hasUser}}`);
    
    // Si l'utilisateur n'est pas présent, mais que nous avons les tokens, récupérer l'utilisateur séparément
    if (hasAccess && hasRefresh && !hasUser) {
      // Stocker les tokens
      await SecureStore.setItemAsync('auth_token', response.data.access);
      await SecureStore.setItemAsync('refresh_token', response.data.refresh);
      
      // Récupérer les données utilisateur séparément
      console.log('Récupération des données utilisateur séparément');
      try {
        const userResponse = await apiServices.profile.getMyProfile();
        
        if (userResponse.data) {
          console.log('Données utilisateur récupérées avec succès');
          
          // Stocker les données utilisateur
          const userString = JSON.stringify(userResponse.data);
          console.log('userString créé, longueur:', userString.length);
          
          await SecureStore.setItemAsync('user_data', userString);
          
          // Mettre à jour l'état
          setUser(userResponse.data);
          
          console.log('Connexion réussie');
          return { success: true };
        } else {
          throw new Error('Impossible de récupérer les données utilisateur');
        }
      } catch (userError) {
        console.error('Erreur lors de la récupération des données utilisateur:', userError);
        throw new Error('Échec de la récupération des données utilisateur');
      }
    } else if (hasAccess && hasRefresh) {
      // Comportement normal si tous les éléments sont présents
      const { access, refresh, user } = response.data;
      
      // Stocker les tokens
      await SecureStore.setItemAsync('auth_token', access);
      await SecureStore.setItemAsync('refresh_token', refresh);
      
      // Stocker les données utilisateur
      const userString = JSON.stringify(user);
      await SecureStore.setItemAsync('user_data', userString);
      
      // Mettre à jour l'état
      setUser(user);
      
      console.log('Connexion réussie');
      return { success: true };
    } else {
      throw new Error('Réponse d\'API incomplète');
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    console.error('Message d\'erreur:', error.message);
    
    if (error.response) {
      console.error('Statut d\'erreur:', error.response.status);
    }
    
    // Renvoyer le message d'erreur
    return { 
      success: false, 
      error: error.message || 'Échec de la connexion'
    };
  } finally {
    console.log('Fin de la tentative de connexion');
    setLoading(false);
  }
};

  // Fonction d'inscription
  const register = async (userData) => {
    setLoading(true);
    console.log('Tentative d\'inscription avec:', userData ? JSON.stringify(userData) : 'undefined');
    try {
      // Appeler l'API d'inscription
      console.log('Appel de l\'API d\'inscription');
      const response = await apiServices.auth.register(userData);
      
      console.log('Réponse de l\'API reçue avec status:', response.status);
      console.log('Données de réponse:', response.data ? 'Présentes' : 'Absentes');
      
      // Vérifier si response.data existe
      if (!response.data) {
        throw new Error('Aucune donnée reçue de l\'API');
      }
      
      // Récupérer les tokens et les données utilisateur
      const { access, refresh, user } = response.data;
      
      // Vérifier si les données obligatoires sont présentes
      if (!access || !refresh || !user) {
        console.error('Données manquantes dans la réponse:', { 
          access: !!access, 
          refresh: !!refresh, 
          user: !!user 
        });
        throw new Error('Réponse d\'API incomplète');
      }
      
      console.log('Type de access:', typeof access);
      console.log('Type de refresh:', typeof refresh);
      console.log('Type de user:', typeof user);
      
      // Stocker les tokens et les données utilisateur
      console.log('Stockage du token d\'accès');
      await SecureStore.setItemAsync('auth_token', access);
      console.log('Stockage du token de rafraîchissement');
      await SecureStore.setItemAsync('refresh_token', refresh);
      
      // Convertir l'objet user en chaîne JSON
      const userString = JSON.stringify(user);
      if (!userString) {
        throw new Error('Échec de la sérialisation des données utilisateur');
      }
      
      console.log('userString créé');
      if (userString) {
        console.log('Longueur userString:', userString.length);
        console.log('Début de userString:', userString.substring(0, Math.min(100, userString.length)) + '...');
      }
      
      console.log('Stockage des données utilisateur');
      await SecureStore.setItemAsync('user_data', userString);
      
      // Définir l'utilisateur
      console.log('Mise à jour de l\'état user');
      setUser(user);
      
      console.log('Inscription réussie');
      return { success: true };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      console.error('Message d\'erreur:', error.message);
      
      if (error.response) {
        console.error('Statut d\'erreur:', error.response.status);
        console.error('Données de réponse d\'erreur:', error.response.data ? JSON.stringify(error.response.data) : 'Aucune donnée');
      } else if (error.request) {
        console.error('Pas de réponse reçue pour la requête');
      }
      
      // Renvoyer le message d'erreur
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Échec de l\'inscription'
      };
    } finally {
      console.log('Fin de la tentative d\'inscription');
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setLoading(true);
    console.log('Tentative de déconnexion');
    try {
      // Supprimer les tokens et les données utilisateur
      console.log('Suppression du token d\'accès');
      await SecureStore.deleteItemAsync('auth_token');
      console.log('Suppression du token de rafraîchissement');
      await SecureStore.deleteItemAsync('refresh_token');
      console.log('Suppression des données utilisateur');
      await SecureStore.deleteItemAsync('user_data');
      
      // Réinitialiser l'utilisateur
      console.log('Réinitialisation de l\'état user');
      setUser(null);
      
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      console.error('Message d\'erreur:', error.message);
    } finally {
      console.log('Fin de la tentative de déconnexion');
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserData = async (userData) => {
    console.log('Mise à jour des données utilisateur:', userData ? JSON.stringify(userData) : 'undefined');
    try {
      if (!user) {
        console.error('Impossible de mettre à jour - user est null');
        return;
      }
      
      if (!userData) {
        console.error('Données de mise à jour invalides');
        return;
      }
      
      // Créer le nouvel objet utilisateur
      const updatedUser = { ...user, ...userData };
      
      // Mettre à jour l'état
      console.log('Mise à jour de l\'état user');
      setUser(updatedUser);
      
      // Convertir en chaîne JSON
      const userString = JSON.stringify(updatedUser);
      if (!userString) {
        throw new Error('Échec de la sérialisation des données utilisateur mises à jour');
      }
      
      console.log('userString créé, longueur:', userString.length);
      
      // Stocker dans SecureStore
      console.log('Stockage des données utilisateur mises à jour');
      await SecureStore.setItemAsync('user_data', userString);
      
      console.log('Mise à jour des données utilisateur réussie');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données utilisateur:', error);
      console.error('Message d\'erreur:', error.message);
    }
  };

  // Valeurs du contexte
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserData,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;