// src/components/common/Input.js

import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

/**
 * Composant d'entrée de texte personnalisé
 * 
 * @param {string} label - Étiquette du champ
 * @param {string} value - Valeur du champ
 * @param {function} onChangeText - Fonction à exécuter lors du changement de texte
 * @param {string} placeholder - Texte d'indication
 * @param {boolean} secureTextEntry - Si le champ est un mot de passe
 * @param {boolean} error - Si le champ contient une erreur
 * @param {string} errorText - Message d'erreur à afficher
 * @param {string} keyboardType - Type de clavier
 * @param {boolean} autoCapitalize - Si la première lettre est majuscule
 * @param {boolean} multiline - Si le champ accepte plusieurs lignes
 * @param {object} style - Style supplémentaire pour le champ
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = false,
  errorText = '',
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  style,
}) => {
  // État pour afficher/masquer le mot de passe
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Afficher ou masquer le mot de passe
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputError,
        style
      ]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry && !passwordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={togglePasswordVisibility}
          >
            <Ionicons 
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={24} 
              color={colors.textLight} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  eyeIcon: {
    padding: 10,
  },
});

export default Input;