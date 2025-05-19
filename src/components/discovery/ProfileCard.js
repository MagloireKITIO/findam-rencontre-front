// src/components/discovery/ProfileCard.js

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

/**
 * Composant de carte de profil pour l'écran de découverte
 * @param {Object} profile - Données du profil à afficher
 */
const ProfileCard = ({ profile }) => {
  const navigation = useNavigation();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Trouver la photo principale ou utiliser la première
  const getPhotos = () => {
    if (!profile.photos || profile.photos.length === 0) {
      return [{
        id: 'placeholder',
        image: 'https://via.placeholder.com/400x600/e0e0e0/cccccc?text=No+Photo'
      }];
    }
    
    // Trier pour mettre la photo principale en premier
    return [...profile.photos].sort((a, b) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return 0;
    });
  };

  const photos = getPhotos();

  // Afficher la photo suivante
  const showNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      setImageLoading(true);
    }
  };

  // Afficher la photo précédente
  const showPrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
      setImageLoading(true);
    }
  };

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = () => {
    if (!profile.date_of_birth) return null;
    
    const birthDate = new Date(profile.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Formater la distance
  const formatDistance = () => {
    if (profile.distance === null || profile.distance === undefined) {
      return 'Distance inconnue';
    }
    
    if (profile.distance < 1) {
      return 'Moins de 1 km';
    }
    
    return `${Math.round(profile.distance)} km`;
  };

  // Basculer l'affichage des détails
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Gérer la navigation vers le profil complet
  const navigateToFullProfile = () => {
    // Cette fonction sera implémentée plus tard avec la navigation vers le profil complet
    Alert.alert('Information', 'La navigation vers le profil complet sera implémentée prochainement.');
  };

  const age = calculateAge();

  return (
    <View style={styles.container}>
      {/* Photos du profil avec navigation */}
      <View style={styles.photoContainer}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        
        <Image
          source={{ uri: photos[currentPhotoIndex].image }}
          style={styles.photo}
          onLoad={() => setImageLoading(false)}
          resizeMode="cover"
        />
        
        {/* Indicateurs de pagination des photos */}
        <View style={styles.photoIndicators}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.photoIndicator,
                index === currentPhotoIndex && styles.photoIndicatorActive
              ]}
            />
          ))}
        </View>
        
        {/* Navigation entre les photos */}
        {photos.length > 1 && (
          <>
            {currentPhotoIndex > 0 && (
              <TouchableOpacity
                style={[styles.photoNavButton, styles.photoNavLeft]}
                onPress={showPrevPhoto}
              >
                <Ionicons name="chevron-back" size={30} color="white" />
              </TouchableOpacity>
            )}
            
            {currentPhotoIndex < photos.length - 1 && (
              <TouchableOpacity
                style={[styles.photoNavButton, styles.photoNavRight]}
                onPress={showNextPhoto}
              >
                <Ionicons name="chevron-forward" size={30} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}
        
        {/* Informations de base superposées sur la photo */}
        <View style={styles.profileInfo}>
          <Text style={styles.nameText}>
            {profile.first_name || profile.username}, {age}
            {profile.is_verified && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.verifiedIcon} />
            )}
          </Text>
          
          <View style={styles.profileDetails}>
            {profile.location && (
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color={colors.textInverted} />
                <Text style={styles.detailText}>{profile.location}</Text>
              </View>
            )}
            
            {profile.distance !== undefined && (
              <View style={styles.detailItem}>
                <Ionicons name="navigate-outline" size={16} color={colors.textInverted} />
                <Text style={styles.detailText}>{formatDistance()}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Bouton pour afficher/masquer les détails */}
        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={toggleDetails}
        >
          <Ionicons 
            name={showDetails ? "chevron-down" : "chevron-up"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Détails du profil */}
      {showDetails && (
        <ScrollView style={styles.detailsContainer}>
          {/* Bio */}
          {profile.bio && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}
          
          {/* Intérêts */}
          {profile.profile && profile.profile.interests && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Centres d'intérêt</Text>
              <View style={styles.interestsContainer}>
                {profile.profile.interests.split(',').map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Informations supplémentaires */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            
            <View style={styles.infoGrid}>
              {/* Profession */}
              {profile.profile?.job_title && (
                <View style={styles.infoItem}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.textLight} />
                  <View>
                    <Text style={styles.infoLabel}>Profession</Text>
                    <Text style={styles.infoValue}>{profile.profile.job_title}</Text>
                  </View>
                </View>
              )}
              
              {/* Éducation */}
              {profile.profile?.education && (
                <View style={styles.infoItem}>
                  <Ionicons name="school-outline" size={18} color={colors.textLight} />
                  <View>
                    <Text style={styles.infoLabel}>Éducation</Text>
                    <Text style={styles.infoValue}>
                      {profile.profile.education === 'HS' && 'Lycée'}
                      {profile.profile.education === 'UG' && 'Licence'}
                      {profile.profile.education === 'GD' && 'Master'}
                      {profile.profile.education === 'PD' && 'Doctorat'}
                      {profile.profile.education === 'OT' && 'Autre'}
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Taille */}
              {profile.profile?.height && (
                <View style={styles.infoItem}>
                  <Ionicons name="resize-outline" size={18} color={colors.textLight} />
                  <View>
                    <Text style={styles.infoLabel}>Taille</Text>
                    <Text style={styles.infoValue}>{profile.profile.height} cm</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          
          {/* Bouton pour voir le profil complet */}
          <TouchableOpacity 
            style={styles.fullProfileButton}
            onPress={navigateToFullProfile}
          >
            <Text style={styles.fullProfileButtonText}>Voir le profil complet</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoIndicators: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
  photoIndicatorActive: {
    backgroundColor: 'white',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  photoNavButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  photoNavLeft: {
    left: 10,
  },
  photoNavRight: {
    right: 10,
  },
  profileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  detailText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 4,
  },
  detailsToggle: {
    position: 'absolute',
    bottom: 75,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    maxHeight: 200,
    backgroundColor: colors.card,
    padding: 16,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  bioText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    color: colors.primary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    width: '50%',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  fullProfileButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  fullProfileButtonText: {
    color: colors.textInverted,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ProfileCard;