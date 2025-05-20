// src/contexts/WebSocketContext.js

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { config } from '../constants/config';
import { useAuth } from './AuthContext';
import WebSocketService from '../services/websocket';

// Création du contexte
const WebSocketContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

// Fournisseur du contexte
export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [webSocketMessages, setWebSocketMessages] = useState([]);
  
  // Gérer les messages WebSocket
  const handleWebSocketMessage = useCallback((data) => {
    console.log('WebSocket message received in context:', data);
    setWebSocketMessages(prev => [...prev, data]);
  }, []);
  
  // Gérer l'état de connexion
  const handleConnectionStatus = useCallback((connected) => {
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, []);

  // Connecter au WebSocket lorsque l'authentification change
  useEffect(() => {
    const setupWebSocket = async () => {
      if (isAuthenticated) {
        try {
          // Récupérer le token d'authentification
          const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
          
          if (token) {
            // Ajouter les gestionnaires
            WebSocketService.addMessageHandler(handleWebSocketMessage);
            WebSocketService.addConnectionHandler(handleConnectionStatus);
            
            // Se connecter au WebSocket
            WebSocketService.connect('/ws/chat/', token);
            
            setConnectionStatus('connecting');
          } else {
            console.warn('No authentication token found');
          }
        } catch (error) {
          console.error('Error setting up WebSocket:', error);
          setConnectionStatus('error');
        }
      } else {
        // Déconnecter si non authentifié
        WebSocketService.disconnect();
        setConnectionStatus('disconnected');
      }
    };
    
    setupWebSocket();
    
    // Nettoyer
    return () => {
      WebSocketService.removeMessageHandler(handleWebSocketMessage);
      WebSocketService.removeConnectionHandler(handleConnectionStatus);
    };
  }, [isAuthenticated, handleWebSocketMessage, handleConnectionStatus]);
  
  // Fonction pour se connecter au WebSocket
  const connectWebSocket = useCallback(async () => {
    if (isAuthenticated && connectionStatus === 'disconnected') {
      try {
        const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          WebSocketService.connect('/ws/chat/', token);
          setConnectionStatus('connecting');
        }
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        setConnectionStatus('error');
      }
    }
  }, [isAuthenticated, connectionStatus]);
  
  // Fonction pour envoyer un message WebSocket
  const sendWebSocketMessage = useCallback((message) => {
    const sent = WebSocketService.sendMessage(message);
    if (!sent && connectionStatus !== 'connected') {
      // Tenter de se reconnecter
      connectWebSocket();
      // Retourner false pour indiquer l'échec
      return false;
    }
    return sent;
  }, [connectionStatus, connectWebSocket]);
  
  // Fonction pour se déconnecter
  const disconnectWebSocket = useCallback(() => {
    WebSocketService.disconnect();
    setConnectionStatus('disconnected');
  }, []);
  
  // Valeurs du contexte
  const value = {
    connectionStatus,
    webSocketMessages,
    connectWebSocket,
    disconnectWebSocket,
    sendWebSocketMessage
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;