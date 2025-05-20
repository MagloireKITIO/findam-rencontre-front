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
      console.log("WebSocket: déjà connecté ou en cours de connexion");
      return Promise.resolve();
    }

    this.isConnecting = true;
    console.log(`WebSocket: tentative de connexion à ${path} avec token`);
    
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${config.WEBSOCKET_URL}${path}?token=${token}`;
        console.log(`WebSocket: URL de connexion: ${wsUrl.replace(/token=([^&]+)/, 'token=***')}`);
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('WebSocket: connexion établie');
          this.connected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.notifyConnectionHandlers(true);
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket: message reçu', data.type || 'type inconnu');
            this.notifyMessageHandlers(data);
          } catch (e) {
            console.error('WebSocket: erreur lors du parsing du message:', e);
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket: erreur de connexion:', error);
          this.notifyErrorHandlers(error);
          this.isConnecting = false;
          reject(error);
        };
        
        this.socket.onclose = (event) => {
          console.log(`WebSocket: connexion fermée - code: ${event.code}, raison: ${event.reason}`);
          this.connected = false;
          this.isConnecting = false;
          this.notifyConnectionHandlers(false);
          this.notifyCloseHandlers(event);
          
          // Tentative de reconnexion
          this.attemptReconnect(path, token);
        };
      } catch (error) {
        console.error('WebSocket: erreur lors de la création de la connexion:', error);
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
      console.log(`WebSocket: nouvelle tentative dans ${delay/1000}s (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`WebSocket: tentative de reconnexion (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect(path, token).catch((error) => {
          console.error('WebSocket: échec de la reconnexion:', error);
        });
      }, delay);
    } else {
      console.log(`WebSocket: nombre maximum de tentatives atteint (${this.maxReconnectAttempts})`);
    }
  }
  
  /**
   * Déconnecte du serveur WebSocket
   */
  disconnect() {
    console.log('WebSocket: demande de déconnexion');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
      console.log('WebSocket: timer de reconnexion annulé');
    }
    
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      this.socket.close();
      this.socket = null;
      console.log('WebSocket: socket fermé');
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
      const message = JSON.stringify(data);
      console.log(`WebSocket: envoi de message - action: ${data.action}, conversation: ${data.conversation_id || 'N/A'}`);
      this.socket.send(message);
      return true;
    }
    console.warn('WebSocket: tentative d\'envoi sans connexion active');
    return false;
  }
  
  /**
   * Ajoute un gestionnaire de messages
   * @param {function} handler - Fonction de callback
   */
  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
    console.log(`WebSocket: gestionnaire de messages ajouté (total: ${this.messageHandlers.length})`);
  }
  
  /**
   * Supprime un gestionnaire de messages
   * @param {function} handler - Fonction de callback à supprimer
   */
  removeMessageHandler(handler) {
    const initialCount = this.messageHandlers.length;
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    console.log(`WebSocket: gestionnaire de messages supprimé (${initialCount} -> ${this.messageHandlers.length})`);
  }
  
  /**
   * Ajoute un gestionnaire de connexion
   * @param {function} handler - Fonction de callback
   */
  addConnectionHandler(handler) {
    this.connectionHandlers.push(handler);
    console.log(`WebSocket: gestionnaire de connexion ajouté (total: ${this.connectionHandlers.length})`);
  }
  
  /**
   * Supprime un gestionnaire de connexion
   * @param {function} handler - Fonction de callback à supprimer
   */
  removeConnectionHandler(handler) {
    const initialCount = this.connectionHandlers.length;
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    console.log(`WebSocket: gestionnaire de connexion supprimé (${initialCount} -> ${this.connectionHandlers.length})`);
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
        console.error('WebSocket: erreur dans le gestionnaire de messages:', e);
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
        console.error('WebSocket: erreur dans le gestionnaire de connexion:', e);
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
        console.error('WebSocket: erreur dans le gestionnaire d\'erreurs:', e);
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
        console.error('WebSocket: erreur dans le gestionnaire de fermeture:', e);
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
  
  /**
   * Obtient l'état actuel du socket
   * @returns {string} - Description de l'état du socket
   */
  getSocketState() {
    if (!this.socket) return 'DISCONNECTED';
    
    switch(this.socket.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

// Instance singleton
export default new WebSocketService();