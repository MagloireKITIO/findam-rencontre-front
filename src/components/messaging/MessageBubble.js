// src/components/messaging/MessageBubble.js

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

/**
 * Composant pour afficher une bulle de message
 * @param {Object} message - Données du message
 * @param {string} otherUserName - Nom de l'autre utilisateur
 */
const MessageBubble = ({ message, otherUserName }) => {
  const isSender = message.is_sender;
  
  // Formater l'heure du message
  const formatMessageTime = (dateString) => {
    const messageDate = new Date(dateString);
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Afficher le statut d'envoi du message
  const renderMessageStatus = () => {
    if (isSender) {
      // Statut: envoyé, livré, lu
      if (message.is_read) {
        return (
          <Ionicons name="checkmark-done" size={14} color={colors.primary} />
        );
      } else {
        return (
          <Ionicons name="checkmark" size={14} color={colors.textLight} />
        );
      }
    }
    return null;
  };
  
  return (
    <View style={[
      styles.container,
      isSender ? styles.senderContainer : styles.receiverContainer
    ]}>
      <View style={[
        styles.bubble,
        isSender ? styles.senderBubble : styles.receiverBubble
      ]}>
        <Text style={[
          styles.messageText,
          isSender ? styles.senderText : styles.receiverText
        ]}>
          {message.content}
        </Text>
      </View>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatMessageTime(message.created_at)}
        </Text>
        {renderMessageStatus()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  senderContainer: {
    alignSelf: 'flex-end',
  },
  receiverContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
  },
  senderBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  receiverBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  senderText: {
    color: colors.textInverted,
  },
  receiverText: {
    color: colors.text,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textLight,
    marginRight: 4,
  },
});

export default MessageBubble;