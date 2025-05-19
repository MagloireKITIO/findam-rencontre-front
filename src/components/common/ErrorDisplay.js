// src/components/common/ErrorDisplay.js - Nouveau composant pour afficher les erreurs

import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';

/**
 * Composant pour afficher les erreurs de validation
 * @param {Object} errors - Objet contenant les erreurs de validation
 */
const ErrorDisplay = ({ errors }) => {
  // Si pas d'erreurs ou objet vide, ne rien afficher
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }
  
  // Fonction récursive pour traiter les erreurs imbriquées
  const flattenErrors = (errObj, prefix = '') => {
    let flatErrors = [];
    
    Object.entries(errObj).forEach(([key, value]) => {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Erreurs imbriquées (par ex. profile.height)
        flatErrors = [...flatErrors, ...flattenErrors(value, fieldName)];
      } else if (Array.isArray(value)) {
        // Liste d'erreurs pour un champ
        value.forEach(error => {
          flatErrors.push(`${fieldName}: ${error}`);
        });
      } else if (value) {
        // Erreur simple
        flatErrors.push(`${fieldName}: ${value}`);
      }
    });
    
    return flatErrors;
  };
  
  const errorsList = flattenErrors(errors);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Erreurs de validation:</Text>
      <ScrollView style={styles.scrollContainer}>
        {errorsList.map((error, index) => (
          <Text key={index} style={styles.errorText}>
            • {error}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.error + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  scrollContainer: {
    maxHeight: 150,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: 4,
  },
});

export default ErrorDisplay;