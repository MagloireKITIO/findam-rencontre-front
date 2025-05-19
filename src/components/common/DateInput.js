// src/components/common/DateInput.js

import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../constants/colors';

/**
 * Composant d'entrée de date personnalisé
 * 
 * @param {string} label - Étiquette du champ
 * @param {Date} value - Valeur de la date sélectionnée
 * @param {function} onChange - Fonction à exécuter lors du changement de date
 * @param {string} placeholder - Texte d'indication
 * @param {boolean} error - Si le champ contient une erreur
 * @param {string} errorText - Message d'erreur à afficher
 * @param {Date} minimumDate - Date minimum sélectionnable
 * @param {Date} maximumDate - Date maximum sélectionnable
 * @param {object} style - Style supplémentaire pour le champ
 */
const DateInput = ({
  label,
  value,
  onChange,
  placeholder = 'Sélectionner une date',
  error = false,
  errorText = '',
  minimumDate,
  maximumDate,
  style,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Formater la date pour l'affichage
  const formatDate = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Ouvrir le sélecteur de date
  const openPicker = () => {
    setShowPicker(true);
  };
  
  // Gérer le changement de date
  const handleChange = (event, selectedDate) => {
    // Sur iOS, on peut annuler la sélection
    const currentDate = selectedDate || value;
    
    // Fermer le sélecteur sur Android
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    // Appeler la fonction onChange avec la date sélectionnée
    onChange(currentDate);
  };
  
  // Confirmer la sélection sur iOS
  const confirmIOSDate = () => {
    setShowPicker(false);
  };
  
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.inputError,
        ]}
        onPress={openPicker}
      >
        <Text 
          style={[
            styles.dateText,
            !value && styles.placeholderText
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
        
        <Ionicons name="calendar-outline" size={20} color={colors.textLight} />
      </TouchableOpacity>
      
      {error && errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}
      
      {/* Sélecteur de date (différent selon la plateforme) */}
      {showPicker && (
        Platform.OS === 'ios' ? (
          <Modal
            visible={showPicker}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.cancelText}>Annuler</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.modalTitle}>{label || 'Sélectionner une date'}</Text>
                  
                  <TouchableOpacity onPress={confirmIOSDate}>
                    <Text style={styles.confirmText}>Confirmer</Text>
                  </TouchableOpacity>
                </View>
                
                <DateTimePicker
                  value={value || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  locale="fr-FR"
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
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
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textLight,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  // Styles du modal (iOS)
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textLight,
  },
  confirmText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default DateInput;