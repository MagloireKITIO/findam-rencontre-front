// src/screens/profile/EditPreferencesScreen.js

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Switch,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { colors } from '../../constants/colors';
import Button from '../../components/common/Button';
import apiServices from '../../services/api';

const EditPreferencesScreen = () => {
  const navigation = useNavigation();
  
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
    loadPreferences();
  }, []);
  
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
  const savePreferences = async () => {
    // Valider les données
    if (!validateAgeRange()) return;
    
    setSaving(true);
    try {
      await apiServices.matchmaking.updateUserPreferences(preferences);
      Alert.alert('Succès', 'Vos préférences ont été mises à jour avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour vos préférences. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des préférences...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes préférences</Text>
        <View style={styles.emptySpace} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
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
          
          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.switchLabel}>Afficher uniquement les profils vérifiés</Text>
              <Text style={styles.switchDescription}>
                N'affiche que les utilisateurs dont le profil a été vérifié par notre équipe
              </Text>
            </View>
            
            <Switch
              value={preferences.show_verified_only}
              onValueChange={(value) => handleInputChange('show_verified_only', value)}
              trackColor={{ false: colors.border, true: colors.primary + '70' }}
              thumbColor={preferences.show_verified_only ? colors.primary : colors.card}
            />
          </View>
        </View>
        
        {/* Boutons d'action */}
        <View style={styles.buttonsContainer}>
          <Button
            label="Annuler"
            onPress={() => navigation.goBack()}
            variant="outlined"
            style={styles.button}
          />
          
          <Button
            label="Enregistrer"
            onPress={savePreferences}
            loading={saving}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptySpace: {
    width: 40,
  },
  content: {
    padding: 16,
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

export default EditPreferencesScreen;