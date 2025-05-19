// src/screens/profile/SettingsScreen.js

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Switch,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import apiServices from '../../services/api';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailsEnabled, setEmailsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  // Charger les préférences de notification
  useEffect(() => {
    loadNotificationPreferences();
  }, []);
  
  // Charger les préférences de notification
  const loadNotificationPreferences = async () => {
    try {
      const response = await apiServices.notifications.getNotificationPreferences();
      setNotificationsEnabled(response.data.push_enabled);
      setEmailsEnabled(response.data.email_enabled);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences de notification:', error);
    }
  };
  
  // Mettre à jour les préférences de notification
  const updateNotificationPreferences = async (type, value) => {
    try {
      let preferences = {};
      
      if (type === 'push') {
        preferences.push_enabled = value;
        setNotificationsEnabled(value);
      } else if (type === 'email') {
        preferences.email_enabled = value;
        setEmailsEnabled(value);
      }
      
      await apiServices.notifications.updateNotificationPreferences(preferences);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de notification:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour vos préférences. Veuillez réessayer.');
      
      // Réinitialiser l'état
      if (type === 'push') {
        setNotificationsEnabled(!value);
      } else if (type === 'email') {
        setEmailsEnabled(!value);
      }
    }
  };
  
  // Changer le mot de passe
  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };
  
  // Déconnecter l'utilisateur
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };
  
  // Accéder aux conditions d'utilisation
  const openTermsOfService = () => {
    Linking.openURL('https://findam.cm/terms');
  };
  
  // Accéder à la politique de confidentialité
  const openPrivacyPolicy = () => {
    Linking.openURL('https://findam.cm/privacy');
  };
  
  // Signaler un problème
  const reportProblem = () => {
    // Ouvrir le client de messagerie avec un email prérempli
    Linking.openURL('mailto:support@findam.cm?subject=Signalement%20de%20problème%20sur%20Findam');
  };
  
  // Supprimer le compte
  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer le compte', 
          style: 'destructive',
          onPress: () => {
            // Afficher une deuxième confirmation
            Alert.alert(
              'Confirmation',
              'Veuillez confirmer une dernière fois la suppression de votre compte.',
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Confirmer', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Appel API pour supprimer le compte
                      await apiServices.profile.deleteAccount();
                      // Déconnexion
                      logout();
                    } catch (error) {
                      console.error('Erreur lors de la suppression du compte:', error);
                      Alert.alert('Erreur', 'Impossible de supprimer votre compte. Veuillez réessayer plus tard.');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };
  
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
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.emptySpace} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Section compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.settingContent}>
              <Ionicons name="person-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Modifier mon profil</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('EditPhotos')}
          >
            <View style={styles.settingContent}>
              <Ionicons name="images-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Gérer mes photos</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleChangePassword}
          >
            <View style={styles.settingContent}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Changer mon mot de passe</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* Section préférences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('EditPreferences')}
          >
            <View style={styles.settingContent}>
              <Ionicons name="options-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Préférences de matchmaking</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Notifications push</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => updateNotificationPreferences('push', value)}
              trackColor={{ false: colors.border, true: colors.primary + '70' }}
              thumbColor={notificationsEnabled ? colors.primary : colors.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="mail-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Emails</Text>
            </View>
            <Switch
              value={emailsEnabled}
              onValueChange={(value) => updateNotificationPreferences('email', value)}
              trackColor={{ false: colors.border, true: colors.primary + '70' }}
              thumbColor={emailsEnabled ? colors.primary : colors.card}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="location-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Partage de localisation</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '70' }}
              thumbColor={locationEnabled ? colors.primary : colors.card}
            />
          </View>
        </View>
        
        {/* Section premium */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => navigation.navigate('Premium')}
          >
            <View style={styles.settingContent}>
              <Ionicons name="star" size={22} color={colors.secondary} style={styles.settingIcon} />
              <View>
                <Text style={styles.settingText}>Passez à Premium</Text>
                <Text style={styles.settingDescription}>Débloquez toutes les fonctionnalités</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* Section support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={openTermsOfService}
          >
            <View style={styles.settingContent}>
              <Ionicons name="document-text-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Conditions d'utilisation</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={openPrivacyPolicy}
          >
            <View style={styles.settingContent}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Politique de confidentialité</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={reportProblem}
          >
            <View style={styles.settingContent}>
              <Ionicons name="help-circle-outline" size={22} color={colors.text} style={styles.settingIcon} />
              <Text style={styles.settingText}>Signaler un problème</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* Section déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleLogout}
          >
            <View style={styles.settingContent}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} style={styles.settingIcon} />
              <Text style={[styles.settingText, styles.logoutText]}>Déconnexion</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Section suppression du compte */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingContent}>
              <Ionicons name="trash-outline" size={22} color={colors.error} style={styles.settingIcon} />
              <Text style={[styles.settingText, styles.deleteAccountText]}>Supprimer mon compte</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Version de l'application */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Findam v1.0.0</Text>
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  logoutText: {
    color: colors.error,
  },
  deleteAccountText: {
    color: colors.error,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  versionText: {
    fontSize: 14,
    color: colors.textLight,
  },
});

export default SettingsScreen;