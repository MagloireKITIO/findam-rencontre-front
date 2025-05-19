// src/components/common/EmptyState.js

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

/**
 * Composant pour afficher un état vide avec une icône, un message et une action
 * 
 * @param {string} icon - Nom de l'icône Ionicons
 * @param {string} title - Titre principal
 * @param {string} message - Message descriptif
 * @param {string} actionText - Texte du bouton d'action (optionnel)
 * @param {function} onAction - Fonction à appeler lors du clic sur le bouton (optionnel)
 * @param {object} style - Style supplémentaire pour le conteneur principal
 */
const EmptyState = ({
  icon,
  title,
  message,
  actionText,
  onAction,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon || "alert-circle-outline"} size={80} color={colors.textLight} />
      
      <Text style={styles.title}>{title}</Text>
      
      <Text style={styles.message}>{message}</Text>
      
      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.textInverted,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EmptyState;