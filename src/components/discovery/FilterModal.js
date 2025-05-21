// src/components/discovery/FilterModal.js

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors } from '../../constants/colors';
import Button from '../common/Button';
import apiServices from '../../services/api';


/**
 * Modal pour filtrer les profils dans l'écran de découverte
 * @param {boolean} visible - Indique si le modal est visible
 * @param {function} onClose - Fonction appelée à la fermeture du modal
 * @param {function} onApplyFilters - Fonction appelée après l'application des filtres
 */
const FilterModal = ({ visible, onClose, onApplyFilters }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    min_age: 18,
    max_age: 50,
    distance: 50,
    show_verified_only: false
  });

  // Charger les préférences au montage du composant
  useEffect(() => {
    if (visible) {
      loadPreferences();
    }
  }, [visible]);

  // Charger les préférences depuis l'API
  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await apiServices.matchmaking.getUserPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
      Alert.alert('Erreur', 'Impossible de charger vos préférences. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les préférences
  const handleInputChange = (name, value) => {
    setPreferences(prevPreferences => ({
      ...prevPreferences,
      [name]: value
    }));
  };

  // Vérifier que l'âge minimum est inférieur à l'âge maximum
  const validateAgeRange = () => {
    if (preferences.min_age >= preferences.max_age) {
      Alert.alert(
        'Plage d\'âge invalide',
        'L\'âge minimum doit être inférieur à l\'âge maximum.'
      );
      return false;
    }
    return true;
  };

  // Enregistrer les préférences
  const applyFilters = async () => {
    // Valider les données
    if (!validateAgeRange()) return;

    setSaving(true);
    try {
      await apiServices.matchmaking.updateUserPreferences(preferences);
      onApplyFilters();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour vos préférences. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement des préférences...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* En-tête du modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres de découverte</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Section d'âge */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Plage d'âge</Text>

              <View style={styles.sliderContainer}>
                <View style={styles.sliderLabelContainer}>
                  <Text style={styles.sliderLabel}>Min: {preferences.min_age} ans</Text>
                  <Text style={styles.sliderLabel}>Max: {preferences.max_age} ans</Text>
                </View>

                {/* Slider pour l'âge minimum */}
                <Text style={styles.sliderSubLabel}>Âge minimum</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={18}
                  maximumValue={80}
                  step={1}
                  value={preferences.min_age}
                  onValueChange={(value) => handleInputChange('min_age', value)}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />

                {/* Slider pour l'âge maximum */}
                <Text style={styles.sliderSubLabel}>Âge maximum</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={18}
                  maximumValue={80}
                  step={1}
                  value={preferences.max_age}
                  onValueChange={(value) => handleInputChange('max_age', value)}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />
              </View>
            </View>

            {/* Section de distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distance maximale</Text>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>
                  {preferences.distance === 100
                    ? "Pas de limite"
                    : `${preferences.distance} km`}
                </Text>

                <Slider
                  style={styles.slider}
                  minimumValue={5}
                  maximumValue={100}
                  step={5}
                  value={preferences.distance}
                  onValueChange={(value) => handleInputChange('distance', value)}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                  thumbTintColor={colors.primary}
                />

                <View style={styles.sliderRangeLabels}>
                  <Text style={styles.sliderRangeLabel}>5 km</Text>
                  <Text style={styles.sliderRangeLabel}>100 km</Text>
                </View>
              </View>
            </View>

            {/* Autres préférences */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filtres supplémentaires</Text>

              <TouchableOpacity
                style={styles.switchContainer}
                onPress={() => handleInputChange('show_verified_only', !preferences.show_verified_only)}
              >
                <View>
                  <Text style={styles.switchLabel}>Afficher uniquement les profils vérifiés</Text>
                  <Text style={styles.switchDescription}>
                    N'affiche que les utilisateurs dont le profil a été vérifié par notre équipe
                  </Text>
                </View>

                <View style={[
                  styles.customSwitch,
                  preferences.show_verified_only ? styles.switchOn : styles.switchOff
                ]}>
                  <View style={[
                    styles.switchKnob,
                    preferences.show_verified_only ? styles.knobRight : styles.knobLeft
                  ]} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Boutons d'action */}
            <View style={styles.buttonsContainer}>
              <Button
                label="Réinitialiser"
                onPress={() => {
                  setPreferences({
                    min_age: 18,
                    max_age: 50,
                    distance: 50,
                    show_verified_only: false
                  });
                }}
                variant="outlined"
                style={styles.button}
              />

              <Button
                label="Appliquer"
                onPress={applyFilters}
                loading={saving}
                style={styles.button}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  loadingContainer: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 8,
  },
  sliderLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: 'bold',
  },
  sliderSubLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  sliderRangeLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
    flex: 1,
    marginRight: 16,
  },
  customSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  switchOn: {
    backgroundColor: colors.primary,
  },
  switchOff: {
    backgroundColor: colors.border,
  },
  switchKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  knobRight: {
    alignSelf: 'flex-end',
  },
  knobLeft: {
    alignSelf: 'flex-start',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 50,
  },
  button: {
    flex: 0.48,
  },
});

export default FilterModal;