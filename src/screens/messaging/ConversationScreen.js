// src/screens/messaging/ConversationScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import apiServices from '../../services/api';
import { useWebSocket } from '../../contexts/WebSocketContext';
import MessageBubble from '../../components/messaging/MessageBubble';

const ConversationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId, otherUser } = route.params;
  const { 
    connectWebSocket, 
    sendWebSocketMessage, 
    webSocketMessages, 
    connectionStatus 
  } = useWebSocket();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const flatListRef = useRef(null);
  const textInputRef = useRef(null);
  
  // Initialiser la connexion WebSocket et charger les messages au montage
  useEffect(() => {
    console.log('ConversationScreen: initialisation pour conversation', conversationId);
    loadMessages();
    
    // Se connecter au WebSocket si pas déjà connecté
    if (connectionStatus !== 'connected') {
      console.log('ConversationScreen: connexion WebSocket requise');
      connectWebSocket();
    } else {
      console.log('ConversationScreen: WebSocket déjà connecté');
      // Rejoindre la conversation immédiatement si déjà connecté
      joinConversation();
    }
    
    // Configurer le bouton de retour
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerTitleContainer}
          onPress={() => navigateToUserProfile(otherUser.id)}
        >
          <Image
            source={{ uri: getProfilePhoto() }}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={styles.headerTitle}>
              {otherUser.first_name || otherUser.username}
              {otherUser.is_verified && (
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              )}
            </Text>
            {otherUser.is_online ? (
              <Text style={styles.onlineStatus}>En ligne</Text>
            ) : (
              <Text style={styles.offlineStatus}>Hors ligne</Text>
            )}
          </View>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={styles.moreButton}
          onPress={showConversationOptions}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
    });
    
    // Nettoyer
    return () => {
      console.log('ConversationScreen: nettoyage');
      
      // Quitter la conversation via WebSocket
      if (connectionStatus === 'connected') {
        console.log('ConversationScreen: quitter la conversation au démontage');
        leaveConversation();
      }
      
      // Effacer le timeout de typage
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [conversationId]);
  
  // Observer les changements d'état de connexion WebSocket
  useEffect(() => {
    if (connectionStatus === 'connected') {
      console.log('ConversationScreen: WebSocket connecté, rejoindre la conversation');
      joinConversation();
    }
  }, [connectionStatus]);
  
  // Observer les messages WebSocket
  useEffect(() => {
    if (webSocketMessages.length > 0) {
      const lastMessage = webSocketMessages[webSocketMessages.length - 1];
      console.log('ConversationScreen: nouveau message WebSocket reçu:', lastMessage.type);
      
      // Traiter uniquement si le message concerne cette conversation
      if (lastMessage.conversation_id == conversationId || 
          (lastMessage.message && lastMessage.message.conversation_id == conversationId)) {
        
        if (lastMessage.type === 'new_message') {
          console.log('ConversationScreen: nouveau message pour cette conversation');
          // Formater le message pour l'affichage
          const messageForDisplay = {
            id: lastMessage.message.id,
            sender: lastMessage.message.sender_id,
            sender_details: { id: lastMessage.message.sender_id, username: lastMessage.message.sender_username },
            content: lastMessage.message.content,
            message_type: lastMessage.message.message_type,
            is_read: lastMessage.message.is_read,
            created_at: lastMessage.message.created_at,
            is_sender: lastMessage.message.is_sender
          };
          
          // Ajouter uniquement si c'est un nouveau message
          setMessages(prevMessages => {
            // Vérifier si le message existe déjà
            const exists = prevMessages.some(msg => msg.id === messageForDisplay.id);
            if (!exists) {
              return [messageForDisplay, ...prevMessages];
            }
            return prevMessages;
          });
        } else if (lastMessage.type === 'message_read') {
          console.log('ConversationScreen: message marqué comme lu');
          // Mettre à jour le statut lu
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.id == lastMessage.message_id 
                ? {...msg, is_read: true} 
                : msg
            )
          );
        } else if (lastMessage.type === 'user_typing') {
          console.log('ConversationScreen: utilisateur en train d\'écrire');
          // Montrer l'indicateur de frappe
          setIsTyping(true);
          
          // Masquer après 3 secondes
          setTimeout(() => {
            setIsTyping(false);
          }, 3000);
        } else if (lastMessage.type === 'conversation_joined') {
          console.log('ConversationScreen: conversation rejointe');
          // Pourrait être utilisé pour des indicateurs visuels
        } else if (lastMessage.type === 'conversation_left') {
          console.log('ConversationScreen: conversation quittée');
          // Pourrait être utilisé pour des indicateurs visuels
        } else if (lastMessage.type === 'error') {
          console.error('ConversationScreen: erreur WebSocket:', lastMessage.message);
          // Pourrait être utilisé pour afficher une notification d'erreur
        }
      }
    }
  }, [webSocketMessages]);
  
  // Charger les messages
  const loadMessages = async () => {
    setLoading(true);
    try {
      console.log('ConversationScreen: chargement des messages pour conversation', conversationId);
      const response = await apiServices.messaging.getMessages(conversationId);
      if (response.data && response.data.results) {
        console.log(`ConversationScreen: ${response.data.results.length} messages chargés`);
        setMessages(response.data.results);
      } else {
        console.log('ConversationScreen: aucun message trouvé');
        setMessages([]);
      }
    } catch (error) {
      console.error('ConversationScreen: erreur lors du chargement des messages:', error);
      Alert.alert('Erreur', 'Impossible de charger les messages. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Rejoindre la conversation via WebSocket
  const joinConversation = () => {
    console.log('ConversationScreen: rejoindre conversation:', conversationId);
    sendWebSocketMessage({
      action: 'join_conversation',
      conversation_id: conversationId
    });
  };
  
  // Quitter la conversation via WebSocket
  const leaveConversation = () => {
    console.log('ConversationScreen: quitter conversation:', conversationId);
    sendWebSocketMessage({
      action: 'leave_conversation',
      conversation_id: conversationId
    });
  };
  
  // Envoyer un message
  const sendMessage = async () => {
    if (!messageText.trim()) return;
    
    // Masquer le clavier
    Keyboard.dismiss();
    
    const trimmedMessage = messageText.trim();
    setMessageText('');
    setSending(true);
    
    try {
      console.log('ConversationScreen: envoi de message:', trimmedMessage.substring(0, 20) + '...');
      
      // Créer un message temporaire avec ID local pour l'UI
      const tempId = 'temp_' + Date.now();
      const tempMessage = {
        id: tempId,
        content: trimmedMessage,
        message_type: 'TEXT',
        is_read: false,
        created_at: new Date().toISOString(),
        is_sender: true,
        temp: true // Marquer comme temporaire
      };
      
      // Ajouter à l'UI immédiatement pour une réactivité maximale
      setMessages(prevMessages => [tempMessage, ...prevMessages]);
      
      // Envoyer via WebSocket en premier pour plus de réactivité
      const messageSent = sendWebSocketMessage({
        action: 'send_message',
        conversation_id: conversationId,
        content: trimmedMessage,
        message_type: 'TEXT'
      });
      
      console.log('ConversationScreen: message envoyé via WebSocket:', messageSent);
      
      // Puis via l'API REST
      const response = await apiServices.messaging.sendMessage({
        conversation: conversationId,
        content: trimmedMessage,
        message_type: 'TEXT'
      });
      
      if (response.data) {
        console.log('ConversationScreen: message envoyé via API:', response.data.id);
        
        // Remplacer le message temporaire par le vrai message de l'API
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === tempId 
              ? {...response.data, is_sender: true} 
              : msg
          )
        );
      }
    } catch (error) {
      console.error('ConversationScreen: erreur lors de l\'envoi du message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message. Veuillez réessayer.');
      
      // Supprimer le message temporaire en cas d'erreur
      setMessages(prevMessages => prevMessages.filter(msg => !msg.temp));
    } finally {
      setSending(false);
    }
  };
  
  // Marquer un message comme lu
  const markMessageAsRead = async (messageId) => {
    try {
      await apiServices.messaging.markMessageAsRead(messageId);
      console.log('ConversationScreen: message marqué comme lu via API:', messageId);
      
      // Envoyer également via WebSocket
      sendWebSocketMessage({
        action: 'mark_as_read',
        message_id: messageId
      });
    } catch (error) {
      console.error('ConversationScreen: erreur lors du marquage du message comme lu:', error);
    }
  };
  
  // Envoyer l'état de frappe
  const sendTypingStatus = () => {
    // Effacer le timeout précédent
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Envoyer le statut de frappe
    sendWebSocketMessage({
      action: 'typing',
      conversation_id: conversationId
    });
    
    // Définir un nouveau timeout
    const timeout = setTimeout(() => {
      // Ce timeout s'exécute lorsque l'utilisateur a arrêté de taper
    }, 3000);
    
    setTypingTimeout(timeout);
  };
  
  // Naviguer vers le profil de l'utilisateur
  const navigateToUserProfile = (userId) => {
    // Cette fonction sera implémentée plus tard
    Alert.alert('Information', 'La navigation vers le profil sera implémentée prochainement.');
  };
  
  // Afficher les options de conversation
  const showConversationOptions = () => {
    Alert.alert(
      'Options',
      'Que souhaitez-vous faire ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Voir le profil', 
          onPress: () => navigateToUserProfile(otherUser.id) 
        },
        { 
          text: 'Supprimer la conversation', 
          style: 'destructive',
          onPress: confirmDeleteConversation 
        },
      ]
    );
  };
  
  // Confirmer la suppression de la conversation
  const confirmDeleteConversation = () => {
    Alert.alert(
      'Supprimer la conversation',
      'Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: deleteConversation
        }
      ]
    );
  };
  
  // Supprimer la conversation
  const deleteConversation = async () => {
    try {
      console.log('ConversationScreen: suppression de la conversation:', conversationId);
      await apiServices.messaging.deactivateConversation(conversationId);
      navigation.goBack();
    } catch (error) {
      console.error('ConversationScreen: erreur lors de la suppression de la conversation:', error);
      Alert.alert('Erreur', 'Impossible de supprimer cette conversation. Veuillez réessayer.');
    }
  };
  
  // Obtenir la photo de profil
  const getProfilePhoto = () => {
    if (!otherUser || !otherUser.profile_picture) {
      return 'https://via.placeholder.com/100x100/e0e0e0/cccccc?text=No+Photo';
    }
    return otherUser.profile_picture;
  };
  
  // Rendre un message
  const renderMessage = ({ item, index }) => {
    // Marquer les messages non lus de l'autre utilisateur comme lus
    if (!item.is_sender && !item.is_read) {
      markMessageAsRead(item.id);
    }
    
    // Vérifier si c'est le premier message du jour
    const showDateHeader = index === messages.length - 1 || 
      !isSameDay(new Date(item.created_at), new Date(messages[index + 1]?.created_at));
    
    return (
      <View>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>
              {formatMessageDate(item.created_at)}
            </Text>
          </View>
        )}
        <MessageBubble
          message={item}
          otherUserName={otherUser.first_name || otherUser.username}
        />
      </View>
    );
  };
  
  // Vérifier si deux dates sont le même jour
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };
  
  // Formater la date du message
  const formatMessageDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (isSameDay(messageDate, today)) {
      return "Aujourd'hui";
    } else if (isSameDay(messageDate, yesterday)) {
      return "Hier";
    } else {
      // Format: 31 janv. 2023
      return messageDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };
  
  // Afficher un chargement
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des messages...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Indicateur de statut WebSocket */}
      {connectionStatus !== 'connected' && (
        <View style={[
          styles.connectionIndicator,
          connectionStatus === 'connecting' ? styles.connectingIndicator : styles.disconnectedIndicator
        ]}>
          <Text style={styles.connectionText}>
            {connectionStatus === 'connecting' ? 'Connexion en cours...' : 'Déconnecté'}
          </Text>
        </View>
      )}
      
      {/* Indicateur de frappe */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>
            {otherUser.first_name || otherUser.username} est en train d'écrire...
          </Text>
        </View>
      )}
      
      {/* Liste des messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesContainer}
        inverted={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun message. Démarrez la conversation avec {otherUser.first_name || otherUser.username} !
            </Text>
          </View>
        }
      />
      
      {/* Zone de saisie du message */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={styles.messageInput}
          placeholder="Votre message..."
          value={messageText}
          onChangeText={(text) => {
            setMessageText(text);
            if (text.trim()) {
              sendTypingStatus();
            }
          }}
          multiline
          maxLength={1000}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || sending || connectionStatus !== 'connected') && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending || connectionStatus !== 'connected'}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.textInverted} />
          ) : (
            <Ionicons name="send" size={20} color={colors.textInverted} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  backButton: {
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
  },
  moreButton: {
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  onlineStatus: {
    fontSize: 12,
    color: colors.success,
  },
  offlineStatus: {
    fontSize: 12,
    color: colors.textLight,
  },
  connectionIndicator: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  connectingIndicator: {
    backgroundColor: colors.warning + '40',
  },
  disconnectedIndicator: {
    backgroundColor: colors.error + '40',
  },
  connectionText: {
    fontSize: 12,
    color: colors.text,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  typingIndicator: {
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  typingText: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateHeaderText: {
    fontSize: 12,
    color: colors.textLight,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.primary + '80',
  },
});

export default ConversationScreen;