// src/components/common/SelectInput.js

import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

/**
 * Composant de sélection avec menu déroulant
 * 
 * @param {string} label - Étiquette du champ
 * @param {any} value - Valeur sélectionnée
 * @param {function} onValueChange - Fonction appelée lors de la sélection d'une valeur
 * @param {Array} options - Liste d'options (objets avec label et value)
 * @param {string} placeholder - Texte d'indication
 * @param {boolean} error - Si le champ contient une erreur
 * @param {string} errorText - Message d'erreur à afficher
 * @param {object} style - Style supplémentaire pour le champ
 */
const SelectInput = ({
  label,
  value,
  onValueChange,
  options = [],
  placeholder = 'Sélectionner',
  error = false,
  errorText = '',
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Trouver l'option sélectionnée
  const selectedOption = options.find(option => option.value === value);
  
  // Ouvrir le modal
  const openModal = () => {
    setModalVisible(true);
  };
  
  // Fermer le modal
  const closeModal = () => {
    setModalVisible(false);
  };
  
  // Sélectionner une option
  const selectOption = (option) => {
    onValueChange(option.value);
    closeModal();
  };
  
  // Rendu d'une option dans la liste
  const renderOption = ({ item }) => {
    const isSelected = value === item.value;
    
    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.selectedOption]}
        onPress={() => selectOption(item)}
      >
        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
          {item.label}
        </Text>
        
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.selectContainer,
          error && styles.inputError,
        ]}
        onPress={openModal}
      >
        <Text 
          style={[
            styles.selectText,
            !selectedOption && styles.placeholderText
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        
        <Ionicons name="chevron-down" size={20} color={colors.textLight} />
      </TouchableOpacity>
      
      {error && errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : null}
      
      {/* Modal pour la sélection */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Sélectionner une option'}</Text>
              
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.optionsList}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  selectContainer: {
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
  selectText: {
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
  // Styles du modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  closeButton: {
    padding: 4,
  },
  optionsList: {
    paddingBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedOption: {
    backgroundColor: colors.primary + '10',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default SelectInput;