// src/components/common/Button.js

import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';

/**
 * Composant de bouton personnalisé avec plusieurs variantes
 * 
 * @param {string} variant - Type de bouton ('primary', 'secondary', 'outlined', 'text')
 * @param {string} label - Texte du bouton
 * @param {function} onPress - Fonction à exécuter lors du clic
 * @param {boolean} disabled - Si le bouton est désactivé
 * @param {boolean} loading - Si le bouton est en état de chargement
 * @param {object} style - Style supplémentaire pour le bouton
 * @param {object} labelStyle - Style supplémentaire pour le texte du bouton
 */
const Button = ({
  variant = 'primary',
  label,
  onPress,
  disabled = false,
  loading = false,
  style,
  labelStyle,
}) => {
  // Déterminer les styles en fonction de la variante
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outlined':
        return styles.outlinedButton;
      case 'text':
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outlined':
        return styles.outlinedText;
      case 'text':
        return styles.textButtonText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? colors.textInverted : colors.primary} 
          size="small" 
        />
      ) : (
        <Text style={[getTextStyle(), disabled && styles.disabledText, labelStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  outlinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryText: {
    color: colors.textInverted,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryText: {
    color: colors.textInverted,
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlinedText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  textButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;