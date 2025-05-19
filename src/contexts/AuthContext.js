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
      // Récupérer le token et les données utilisateur
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');

      if (token && userData) {
        // Si les données existent, définir l'utilisateur
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (credentials) => {
    setLoading(true);
    try {
      // Appeler l'API de connexion
      const response = await apiServices.auth.login(credentials);
      
      // Récupérer les tokens et les données utilisateur
      const { access, refresh, user } = response.data;
      
      // Stocker les tokens et les données utilisateur
      await SecureStore.setItemAsync('auth_token', access);
      await SecureStore.setItemAsync('refresh_token', refresh);
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      
      // Définir l'utilisateur
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Renvoyer le message d'erreur
      return { 
        success: false, 
        error: error.response?.data?.message || 'Échec de la connexion'
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    setLoading(true);
    try {
      // Appeler l'API d'inscription
      const response = await apiServices.auth.register(userData);
      
      // Récupérer les tokens et les données utilisateur
      const { access, refresh, user } = response.data;
      
      // Stocker les tokens et les données utilisateur
      await SecureStore.setItemAsync('auth_token', access);
      await SecureStore.setItemAsync('refresh_token', refresh);
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      
      // Définir l'utilisateur
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      
      // Renvoyer le message d'erreur
      return { 
        success: false, 
        error: error.response?.data?.message || 'Échec de l\'inscription'
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setLoading(true);
    try {
      // Supprimer les tokens et les données utilisateur
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user_data');
      
      // Réinitialiser l'utilisateur
      setUser(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserData = async (userData) => {
    setUser((prevUser) => ({ ...prevUser, ...userData }));
    await SecureStore.setItemAsync('user_data', JSON.stringify({ ...user, ...userData }));
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