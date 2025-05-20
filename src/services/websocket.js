// src/services/websocket.js

import { config } from '../constants/config';

/**
 * Classe pour gérer les connexions WebSocket
 */
class WebSocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.errorHandlers = [];
    this.closeHandlers = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.isConnecting = false;
    this.connected = false;
  }

  /**
   * Connecte au serveur WebSocket
   * @param {string} path - Chemin WebSocket relatif à la base WebSocket URL
   * @param {string} token - Token d'authentification
   * @returns {Promise} - Promesse résolue quand connecté
   */
  connect(path, token) {
    if (this.isConnecting || this.connected) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${config.WEBSOCKET_URL}${path}?token=${token}`;
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.connected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.notifyMessageHandlers(data);
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.notifyErrorHandlers(error);
          this.isConnecting = false;
          reject(error);
        };
        
        this.socket.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.connected = false;
          this.isConnecting = false;
          this.notifyConnectionHandlers(false);
          this.notifyCloseHandlers(event);
          
          // Tentative de reconnexion
          this.attemptReconnect(path, token);
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  
  /**
   * Tente de se reconnecter au WebSocket
   * @param {string} path - Chemin WebSocket
   * @param {string} token - Token d'authentification
   */
  attemptReconnect(path, token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect(path, token).catch(() => {
          // La reconnexion a échoué, mais la fonction attemptReconnect sera rappelée
          // lors de l'événement onclose
        });
      }, delay);
    }
  }
  
  /**
   * Déconnecte du serveur WebSocket
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }
  
  /**
   * Envoie un message au serveur WebSocket
   * @param {Object} data - Données à envoyer
   * @returns {boolean} - true si le message a été envoyé
   */
  sendMessage(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    }
    return false;
  }
  
  /**
   * Ajoute un gestionnaire de messages
   * @param {function} handler - Fonction de callback
   */
  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }
  
  /**
   * Supprime un gestionnaire de messages
   * @param {function} handler - Fonction de callback à supprimer
   */
  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
  
  /**
   * Ajoute un gestionnaire de connexion
   * @param {function} handler - Fonction de callback
   */
  addConnectionHandler(handler) {
    this.connectionHandlers.push(handler);
  }
  
  /**
   * Supprime un gestionnaire de connexion
   * @param {function} handler - Fonction de callback à supprimer
   */
  removeConnectionHandler(handler) {
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
  }
  
  /**
   * Ajoute un gestionnaire d'erreurs
   * @param {function} handler - Fonction de callback
   */
  addErrorHandler(handler) {
    this.errorHandlers.push(handler);
  }
  
  /**
   * Supprime un gestionnaire d'erreurs
   * @param {function} handler - Fonction de callback à supprimer
   */
  removeErrorHandler(handler) {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }
  
  /**
   * Ajoute un gestionnaire de fermeture
   * @param {function} handler - Fonction de callback
   */
  addCloseHandler(handler) {
    this.closeHandlers.push(handler);
  }
  
  /**
   * Supprime un gestionnaire de fermeture
   * @param {function} handler - Fonction de callback à supprimer
   */
  removeCloseHandler(handler) {
    this.closeHandlers = this.closeHandlers.filter(h => h !== handler);
  }
  
  /**
   * Notifie tous les gestionnaires de messages
   * @param {Object} data - Données reçues
   */
  notifyMessageHandlers(data) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (e) {
        console.error('Error in message handler:', e);
      }
    });
  }
  
  /**
   * Notifie tous les gestionnaires de connexion
   * @param {boolean} connected - État de connexion
   */
  notifyConnectionHandlers(connected) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (e) {
        console.error('Error in connection handler:', e);
      }
    });
  }
  
  /**
   * Notifie tous les gestionnaires d'erreurs
   * @param {Object} error - Erreur survenue
   */
  notifyErrorHandlers(error) {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        console.error('Error in error handler:', e);
      }
    });
  }
  
  /**
   * Notifie tous les gestionnaires de fermeture
   * @param {Object} event - Événement de fermeture
   */
  notifyCloseHandlers(event) {
    this.closeHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error('Error in close handler:', e);
      }
    });
  }
  
  /**
   * Vérifie si la connexion est active
   * @returns {boolean} - true si connecté
   */
  isConnected() {
    return this.connected;
  }
}

// Instance singleton
export default new WebSocketService();