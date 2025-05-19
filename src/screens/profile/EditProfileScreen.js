// src/screens/profile/EditProfileScreen.js

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SelectInput from '../../components/common/SelectInput';
import DateInput from '../../components/common/DateInput';
import apiServices from '../../services/api';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateUserData } = useAuth();
  
  // États pour les informations du profil
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    date_of_birth: user?.date_of_birth || null,
    gender: user?.gender || '',
    seeking: user?.seeking || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profile: {
      height: user?.profile?.height || '',
      education: user?.profile?.education || '',
      job_title: user?.profile?.job_title || '',
      company: user?.profile?.company || '',
      relationship_status: user?.profile?.relationship_status || '',
      has_children: user?.profile?.has_children === null ? null : user?.profile?.has_children,
      interests: user?.profile?.interests || '',
      about_me: user?.profile?.about_me || '',
      looking_for: user?.profile?.looking_for || '',
    }
  });
  
  // Options pour les sélecteurs
  const genderOptions = [
    { label: 'Homme', value: 'M' },
    { label: 'Femme', value: 'F' },
    { label: 'Autre', value: 'O' },
  ];
  
  const seekingOptions = [
    { label: 'Hommes', value: 'M' },
    { label: 'Femmes', value: 'F' },
    { label: 'Les deux', value: 'B' },
  ];
  
  const educationOptions = [
    { label: 'Lycée', value: 'HS' },
    { label: 'Licence', value: 'UG' },
    { label: 'Master', value: 'GD' },
    { label: 'Doctorat', value: 'PD' },
    { label: 'Autre', value: 'OT' },
  ];
  
  const relationshipStatusOptions = [
    { label: 'Célibataire', value: 'S' },
    { label: 'En relation', value: 'R' },
    { label: 'Fiancé(e)', value: 'E' },
    { label: 'Marié(e)', value: 'M' },
    { label: 'Divorcé(e)', value: 'D' },
    { label: 'Veuf/Veuve', value: 'W' },
    { label: 'Compliqué', value: 'C' },
  ];
  
  const childrenOptions = [
    { label: 'Oui', value: true },
    { label: 'Non', value: false },
  ];
  
  // Mettre à jour les champs du formulaire
  const handleInputChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Mettre à jour les champs du profil
  const handleProfileInputChange = (name, value) => {
    setFormData(prevData => ({
      ...prevData,
      profile: {
        ...prevData.profile,
        [name]: value
      }
    }));
  };
  
  // Soumettre le formulaire
  const handleSubmit = async () => {
    // Vérifier les champs obligatoires
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.gender || !formData.seeking) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setLoading(true);
    
    try {
      // Modifier les données pour l'API si nécessaire
      const dataToSubmit = {
        ...formData,
        profile: {
          ...formData.profile,
          height: formData.profile.height ? parseInt(formData.profile.height) : null,
        }
      };
      
      // Appeler l'API pour mettre à jour le profil
      const response = await apiServices.profile.updateProfile(dataToSubmit);
      
      // Mettre à jour les données utilisateur dans le contexte
      updateUserData(response.data);
      
      Alert.alert('Succès', 'Votre profil a été mis à jour avec succès');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour votre profil. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier mon profil</Text>
          <View style={styles.emptySpace} />
        </View>
        
        {/* Formulaire */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <Input
            label="Prénom *"
            value={formData.first_name}
            onChangeText={(text) => handleInputChange('first_name', text)}
            placeholder="Votre prénom"
            autoCapitalize="words"
          />
          
          <Input
            label="Nom *"
            value={formData.last_name}
            onChangeText={(text) => handleInputChange('last_name', text)}
            placeholder="Votre nom"
            autoCapitalize="words"
          />
          
          <DateInput
            label="Date de naissance *"
            value={formData.date_of_birth}
            onChange={(date) => handleInputChange('date_of_birth', date)}
            placeholder="Sélectionnez votre date de naissance"
            maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
          />
          
          <SelectInput
            label="Genre *"
            value={formData.gender}
            onValueChange={(value) => handleInputChange('gender', value)}
            options={genderOptions}
            placeholder="Sélectionnez votre genre"
          />
          
          <SelectInput
            label="Je recherche *"
            value={formData.seeking}
            onValueChange={(value) => handleInputChange('seeking', value)}
            options={seekingOptions}
            placeholder="Je cherche à rencontrer"
          />
          
          <Input
            label="Localité"
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
            placeholder="Votre ville"
          />
          
          <Input
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => handleInputChange('bio', text)}
            placeholder="Parlez-nous de vous"
            multiline
          />
          
          <Text style={styles.sectionTitle}>Informations supplémentaires</Text>
          
          <Input
            label="Taille (cm)"
            value={formData.profile.height ? formData.profile.height.toString() : ''}
            onChangeText={(text) => handleProfileInputChange('height', text)}
            placeholder="Votre taille en centimètres"
            keyboardType="numeric"
          />
          
          <SelectInput
            label="Niveau d'éducation"
            value={formData.profile.education}
            onValueChange={(value) => handleProfileInputChange('education', value)}
            options={educationOptions}
            placeholder="Sélectionnez votre niveau d'éducation"
          />
          
          <Input
            label="Profession"
            value={formData.profile.job_title}
            onChangeText={(text) => handleProfileInputChange('job_title', text)}
            placeholder="Votre profession"
          />
          
          <Input
            label="Entreprise"
            value={formData.profile.company}
            onChangeText={(text) => handleProfileInputChange('company', text)}
            placeholder="Votre entreprise"
          />
          
          <SelectInput
            label="Statut relationnel"
            value={formData.profile.relationship_status}
            onValueChange={(value) => handleProfileInputChange('relationship_status', value)}
            options={relationshipStatusOptions}
            placeholder="Sélectionnez votre statut"
          />
          
          <SelectInput
            label="Avez-vous des enfants ?"
            value={formData.profile.has_children}
            onValueChange={(value) => handleProfileInputChange('has_children', value)}
            options={childrenOptions}
            placeholder="Sélectionnez une option"
          />
          
          <Input
            label="Centres d'intérêt"
            value={formData.profile.interests}
            onChangeText={(text) => handleProfileInputChange('interests', text)}
            placeholder="Vos centres d'intérêt (séparés par des virgules)"
          />
          
          <Input
            label="À propos de moi"
            value={formData.profile.about_me}
            onChangeText={(text) => handleProfileInputChange('about_me', text)}
            placeholder="Décrivez-vous plus en détail"
            multiline
          />
          
          <Input
            label="Ce que je recherche"
            value={formData.profile.looking_for}
            onChangeText={(text) => handleProfileInputChange('looking_for', text)}
            placeholder="Décrivez ce que vous recherchez chez un partenaire"
            multiline
          />
          
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
              onPress={handleSubmit}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  form: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 0.48,
  },
});

export default EditProfileScreen;