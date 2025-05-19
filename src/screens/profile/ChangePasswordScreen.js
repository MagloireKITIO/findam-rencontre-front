// src/screens/profile/ChangePasswordScreen.js

import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import apiServices from '../../services/api';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Valider les entrées
  const validateInputs = () => {
    let isValid = true;
    const newErrors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    if (!oldPassword) {
      newErrors.oldPassword = 'Le mot de passe actuel est requis';
      isValid = false;
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
      isValid = false;
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Soumettre le changement de mot de passe
  const handleSubmit = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    
    try {
      await apiServices.profile.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: confirmPassword
      });
      
      Alert.alert(
        'Succès',
        'Votre mot de passe a été modifié avec succès',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      // Gérer les erreurs spécifiques
      if (error.response?.data?.old_password) {
        setErrors(prev => ({
          ...prev,
          oldPassword: error.response.data.old_password[0]
        }));
      } else if (error.response?.data?.new_password) {
        setErrors(prev => ({
          ...prev,
          newPassword: error.response.data.new_password[0]
        }));
      } else {
        Alert.alert('Erreur', 'Impossible de changer votre mot de passe. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Changer le mot de passe</Text>
        <View style={styles.emptySpace} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          {/* Informations */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Pour changer votre mot de passe, veuillez entrer votre mot de passe actuel puis votre nouveau mot de passe.
            </Text>
          </View>
          
          {/* Formulaire */}
          <Input
            label="Mot de passe actuel"
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Entrez votre mot de passe actuel"
            secureTextEntry
            error={!!errors.oldPassword}
            errorText={errors.oldPassword}
          />
          
          <Input
            label="Nouveau mot de passe"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Entrez votre nouveau mot de passe"
            secureTextEntry
            error={!!errors.newPassword}
            errorText={errors.newPassword}
          />
          
          <Input
            label="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirmez votre nouveau mot de passe"
            secureTextEntry
            error={!!errors.confirmPassword}
            errorText={errors.confirmPassword}
          />
          
          {/* Conseils de sécurité */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Conseils pour un mot de passe sécurisé :</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>Au moins 6 caractères</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>Mélangez lettres, chiffres et symboles</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>Évitez les informations personnelles</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
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
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  tipsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 0.48,
  },
});

export default ChangePasswordScreen;