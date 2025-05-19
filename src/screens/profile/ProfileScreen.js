// src/screens/profile/ProfileScreen.js

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import Button from '../../components/common/Button';
import PhotoGallery from '../../components/profile/PhotoGallery';
import ProfileInfo from '../../components/profile/ProfileInfo';
import apiServices from '../../services/api';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, updateUserData, logout } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Charger les données du profil
  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await apiServices.profile.getMyProfile();
      setUserProfile(response.data);
      // Mettre à jour les données utilisateur dans le contexte
      updateUserData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      Alert.alert('Erreur', 'Impossible de charger votre profil. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Charger le profil au montage du composant
  useEffect(() => {
    loadProfile();
  }, []);
  
  // Fonction de rafraîchissement
  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };
  
  // Gérer la déconnexion
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
  
  // Si le profil est en cours de chargement
  if (loading && !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* En-tête du profil */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Photos de profil */}
      {userProfile && (
        <PhotoGallery 
          photos={userProfile.photos || []} 
          onAddPhoto={() => navigation.navigate('EditPhotos')}
        />
      )}
      
      {/* Informations du profil */}
      {userProfile && (
        <ProfileInfo profile={userProfile} />
      )}
      
      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        <Button 
          label="Modifier mon profil" 
          onPress={() => navigation.navigate('EditProfile')} 
          variant="primary"
          style={styles.actionButton}
        />
        
        <Button 
          label="Gérer mes photos" 
          onPress={() => navigation.navigate('EditPhotos')} 
          variant="outlined"
          style={styles.actionButton}
        />
        
        <Button 
          label="Mes préférences" 
          onPress={() => navigation.navigate('EditPreferences')} 
          variant="outlined"
          style={styles.actionButton}
        />
        
        <Button 
          label="Déconnexion" 
          onPress={handleLogout} 
          variant="text"
          style={styles.actionButton}
          labelStyle={styles.logoutButtonText}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  settingsButton: {
    padding: 8,
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    marginBottom: 12,
  },
  logoutButtonText: {
    color: colors.error,
  },
});

export default ProfileScreen;