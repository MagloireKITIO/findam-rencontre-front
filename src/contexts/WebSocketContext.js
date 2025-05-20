// src/contexts/WebSocketContext.js

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
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
  const messagesRef = useRef([]);
  const reconnectTimerRef = useRef(null);
  
  // Gérer les messages WebSocket
  const handleWebSocketMessage = useCallback((data) => {
    console.log('WebSocketContext: message reçu:', data.type);
    
    // Ajouter le message à l'état et à la référence
    const updatedMessages = [...messagesRef.current, data];
    messagesRef.current = updatedMessages;
    setWebSocketMessages(updatedMessages);
    
    // Limiter le nombre de messages stockés pour éviter les problèmes de mémoire
    if (updatedMessages.length > 100) {
      const trimmedMessages = updatedMessages.slice(-100);
      messagesRef.current = trimmedMessages;
      setWebSocketMessages(trimmedMessages);
    }
  }, []);
  
  // Gérer l'état de connexion
  const handleConnectionStatus = useCallback((connected) => {
    console.log(`WebSocketContext: statut de connexion changé à ${connected ? 'connecté' : 'déconnecté'}`);
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, []);

  // Connecter au WebSocket lorsque l'authentification change
  useEffect(() => {
    const setupWebSocket = async () => {
      if (isAuthenticated) {
        try {
          console.log('WebSocketContext: configuration du WebSocket pour utilisateur authentifié');
          
          // Récupérer le token d'authentification
          const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
          
          if (token) {
            // Ajouter les gestionnaires
            WebSocketService.addMessageHandler(handleWebSocketMessage);
            WebSocketService.addConnectionHandler(handleConnectionStatus);
            
            // Se connecter au WebSocket
            console.log('WebSocketContext: connexion au WebSocket');
            setConnectionStatus('connecting');
            
            try {
              await WebSocketService.connect(config.WEBSOCKET_PATHS.CHAT, token);
              console.log('WebSocketContext: connexion WebSocket réussie');
            } catch (connectionError) {
              console.error('WebSocketContext: erreur de connexion WebSocket:', connectionError);
              setConnectionStatus('error');
              
              // Programmer une nouvelle tentative
              if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
              }
              
              reconnectTimerRef.current = setTimeout(() => {
                console.log('WebSocketContext: nouvelle tentative automatique');
                connectWebSocket();
              }, 5000);
            }
          } else {
            console.warn('WebSocketContext: pas de token d\'authentification trouvé');
            setConnectionStatus('error');
          }
        } catch (error) {
          console.error('WebSocketContext: erreur de configuration WebSocket:', error);
          setConnectionStatus('error');
        }
      } else {
        // Déconnecter si non authentifié
        console.log('WebSocketContext: déconnexion (utilisateur non authentifié)');
        WebSocketService.disconnect();
        setConnectionStatus('disconnected');
      }
    };
    
    setupWebSocket();
    
    // Nettoyer
    return () => {
      console.log('WebSocketContext: nettoyage des gestionnaires');
      WebSocketService.removeMessageHandler(handleWebSocketMessage);
      WebSocketService.removeConnectionHandler(handleConnectionStatus);
      
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [isAuthenticated, handleWebSocketMessage, handleConnectionStatus]);
  
  // Fonction pour se connecter au WebSocket
  const connectWebSocket = useCallback(async () => {
    if (isAuthenticated && connectionStatus !== 'connecting' && connectionStatus !== 'connected') {
      try {
        console.log('WebSocketContext: tentative de connexion WebSocket manuelle');
        setConnectionStatus('connecting');
        
        const token = await SecureStore.getItemAsync(config.STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          try {
            await WebSocketService.connect(config.WEBSOCKET_PATHS.CHAT, token);
            console.log('WebSocketContext: connexion WebSocket manuelle réussie');
          } catch (error) {
            console.error('WebSocketContext: erreur de connexion WebSocket manuelle:', error);
            setConnectionStatus('error');
          }
        } else {
          console.warn('WebSocketContext: pas de token pour connexion manuelle');
          setConnectionStatus('error');
        }
      } catch (error) {
        console.error('WebSocketContext: erreur lors de la connexion WebSocket:', error);
        setConnectionStatus('error');
      }
    } else {
      console.log(`WebSocketContext: connexion WebSocket ignorée (isAuthenticated: ${isAuthenticated}, status: ${connectionStatus})`);
    }
  }, [isAuthenticated, connectionStatus]);
  
  // Fonction pour envoyer un message WebSocket
  const sendWebSocketMessage = useCallback((message) => {
    console.log(`WebSocketContext: envoi de message (action: ${message.action}, status: ${connectionStatus})`);
    
    const sent = WebSocketService.sendMessage(message);
    
    if (!sent && connectionStatus !== 'connected') {
      console.log('WebSocketContext: échec d\'envoi, tentative de reconnexion');
      // Tenter de se reconnecter
      connectWebSocket();
      // Retourner false pour indiquer l'échec
      return false;
    }
    
    return sent;
  }, [connectionStatus, connectWebSocket]);
  
  // Fonction pour se déconnecter
  const disconnectWebSocket = useCallback(() => {
    console.log('WebSocketContext: déconnexion manuelle');
    WebSocketService.disconnect();
    setConnectionStatus('disconnected');
  }, []);
  
  // Valeurs du contexte
  const value = {
    connectionStatus,
    webSocketMessages,
    connectWebSocket,
    disconnectWebSocket,
    sendWebSocketMessage,
    // Ajouter des fonctions utilitaires
    clearMessages: useCallback(() => {
      console.log('WebSocketContext: effacement des messages');
      messagesRef.current = [];
      setWebSocketMessages([]);
    }, []),
    getSocketState: useCallback(() => {
      return WebSocketService.getSocketState();
    }, [])
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;