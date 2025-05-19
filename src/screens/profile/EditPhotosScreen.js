// src/screens/profile/EditPhotosScreen.js

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../constants/colors';
import apiServices from '../../services/api';

const EditPhotosScreen = () => {
  const navigation = useNavigation();
  const { user, updateUserData } = useAuth();
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Charger les photos au montage du composant
  useEffect(() => {
    loadPhotos();
  }, []);
  
  // Charger les photos depuis l'API
  const loadPhotos = async () => {
    setLoading(true);
    try {
      const response = await apiServices.profile.getMyProfile();
      setPhotos(response.data.photos || []);
      
      // Mettre à jour les données utilisateur dans le contexte
      updateUserData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error);
      Alert.alert('Erreur', 'Impossible de charger vos photos. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Demander la permission d'accéder à la galerie
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        'Désolé, nous avons besoin de votre permission pour accéder à vos photos.'
      );
      return false;
    }
    return true;
  };
  
  // Demander la permission d'accéder à la caméra
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        'Désolé, nous avons besoin de votre permission pour accéder à votre caméra.'
      );
      return false;
    }
    return true;
  };
  
  // Sélectionner une image depuis la galerie
  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image. Veuillez réessayer.');
    }
  };
  
  // Prendre une photo avec la caméra
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo. Veuillez réessayer.');
    }
  };
  
  // Uploader l'image sur le serveur
  const uploadImage = async (uri) => {
    // Vérifier si l'utilisateur a déjà atteint le nombre maximum de photos
    if (photos.length >= 6) {
      Alert.alert(
        'Limite atteinte',
        'Vous avez atteint le nombre maximum de photos (6). Veuillez en supprimer une avant d\'en ajouter une nouvelle.'
      );
      return;
    }
    
    setUploadingPhoto(true);
    
    try {
      // Créer un objet FormData
      const formData = new FormData();
      
      // Ajouter l'image au FormData
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      
      formData.append('image', {
        uri,
        name: filename,
        type,
      });
      
      // Si c'est la première photo, définir comme principale
      const isPrimary = photos.length === 0;
      formData.append('is_primary', isPrimary);
      
      // Envoyer l'image au serveur
      const response = await apiServices.profile.addPhoto(formData);
      
      // Recharger les photos
      loadPhotos();
      
      Alert.alert('Succès', 'Photo ajoutée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      Alert.alert('Erreur', 'Impossible d\'uploader l\'image. Veuillez réessayer.');
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  // Supprimer une photo
  const deletePhoto = async (photoId) => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer cette photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiServices.profile.deletePhoto(photoId);
              // Recharger les photos
              loadPhotos();
            } catch (error) {
              console.error('Erreur lors de la suppression de la photo:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la photo. Veuillez réessayer.');
            }
          }
        }
      ]
    );
  };
  
  // Définir une photo comme principale
  const setPrimaryPhoto = async (photoId) => {
    try {
      await apiServices.profile.setPrimaryPhoto(photoId);
      // Recharger les photos
      loadPhotos();
      Alert.alert('Succès', 'Photo principale définie avec succès');
    } catch (error) {
      console.error('Erreur lors de la définition de la photo principale:', error);
      Alert.alert('Erreur', 'Impossible de définir la photo principale. Veuillez réessayer.');
    }
  };
  
  // Afficher les options pour ajouter une photo
  const showAddPhotoOptions = () => {
    Alert.alert(
      'Ajouter une photo',
      'Choisissez une source',
      [
        { 
          text: 'Prendre une photo', 
          onPress: takePhoto 
        },
        { 
          text: 'Choisir depuis la galerie', 
          onPress: pickImage 
        },
        { 
          text: 'Annuler', 
          style: 'cancel' 
        }
      ]
    );
  };
  
  // Rendu d'une photo
  const renderPhoto = (photo, index) => {
    return (
      <View key={photo.id} style={styles.photoItem}>
        <Image 
          source={{ uri: photo.image }} 
          style={styles.photo} 
          resizeMode="cover"
        />
        
        {/* Badge pour la photo principale */}
        {photo.is_primary && (
          <View style={styles.primaryBadge}>
            <Ionicons name="star" size={14} color={colors.textInverted} />
            <Text style={styles.primaryBadgeText}>Principale</Text>
          </View>
        )}
        
        {/* Actions sur la photo */}
        <View style={styles.photoActions}>
          {!photo.is_primary && (
            <TouchableOpacity 
              style={styles.photoAction}
              onPress={() => setPrimaryPhoto(photo.id)}
            >
              <Ionicons name="star-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.photoAction}
            onPress={() => deletePhoto(photo.id)}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Gérer mes photos</Text>
        <View style={styles.emptySpace} />
      </View>
      
      {/* Contenu */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Instructions */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Vous pouvez ajouter jusqu'à 6 photos à votre profil. La photo principale sera celle affichée dans les découvertes.
          </Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement des photos...</Text>
          </View>
        ) : (
          <>
            {/* Grille de photos */}
            <View style={styles.photoGrid}>
              {/* Photos existantes */}
              {photos.map(renderPhoto)}
              
              {/* Bouton d'ajout (si moins de 6 photos) */}
              {photos.length < 6 && (
                <TouchableOpacity 
                  style={styles.addPhotoItem}
                  onPress={showAddPhotoOptions}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="add" size={30} color={colors.primary} />
                      <Text style={styles.addPhotoText}>Ajouter une photo</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
              
              {/* Emplacements vides */}
              {Array.from({ length: Math.max(0, 5 - photos.length) }).map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptyPhotoItem}>
                  <Ionicons name="image-outline" size={30} color={colors.border} />
                </View>
              ))}
            </View>
          </>
        )}
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
  infoCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  photoItem: {
    width: '48%',
    aspectRatio: 3/4,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: colors.card,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryBadgeText: {
    fontSize: 12,
    color: colors.textInverted,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  photoActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 8,
  },
  photoAction: {
    padding: 8,
  },
  addPhotoItem: {
    width: '48%',
    aspectRatio: 3/4,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  emptyPhotoItem: {
    width: '48%',
    aspectRatio: 3/4,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditPhotosScreen;