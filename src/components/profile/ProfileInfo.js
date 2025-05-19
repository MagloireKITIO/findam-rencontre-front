// src/components/profile/ProfileInfo.js

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

/**
 * Composant pour afficher les informations du profil utilisateur
 * @param {Object} profile - Données du profil utilisateur
 */
const ProfileInfo = ({ profile }) => {
  // Calculer l'âge à partir de la date de naissance
  const getAge = () => {
    if (!profile.date_of_birth) return null;
    
    const birthDate = new Date(profile.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Récupérer les intérêts sous forme de tableau
  const getInterests = () => {
    if (!profile.profile || !profile.profile.interests) return [];
    
    // Les intérêts sont stockés sous forme de chaîne séparée par des virgules
    return profile.profile.interests.split(',')
      .map(interest => interest.trim())
      .filter(interest => interest !== '');
  };
  
  // Obtenir le texte pour le genre
  const getGenderText = () => {
    switch (profile.gender) {
      case 'M': return 'Homme';
      case 'F': return 'Femme';
      case 'O': return 'Autre';
      default: return 'Non spécifié';
    }
  };
  
  // Obtenir le texte pour la recherche
  const getSeekingText = () => {
    switch (profile.seeking) {
      case 'M': return 'Hommes';
      case 'F': return 'Femmes';
      case 'B': return 'Les deux';
      default: return 'Non spécifié';
    }
  };
  
  // Obtenir le texte pour le statut relationnel
  const getRelationshipStatusText = () => {
    const status = profile.profile?.relationship_status;
    
    switch (status) {
      case 'S': return 'Célibataire';
      case 'R': return 'En relation';
      case 'E': return 'Fiancé(e)';
      case 'M': return 'Marié(e)';
      case 'D': return 'Divorcé(e)';
      case 'W': return 'Veuf/Veuve';
      case 'C': return 'Compliqué';
      default: return 'Non spécifié';
    }
  };
  
  // Obtenir le texte pour le niveau d'éducation
  const getEducationText = () => {
    const education = profile.profile?.education;
    
    switch (education) {
      case 'HS': return 'Lycée';
      case 'UG': return 'Licence';
      case 'GD': return 'Master';
      case 'PD': return 'Doctorat';
      case 'OT': return 'Autre';
      default: return 'Non spécifié';
    }
  };
  
  const interests = getInterests();
  const age = getAge();
  
  return (
    <View style={styles.container}>
      {/* Informations de base */}
      <View style={styles.section}>
        <Text style={styles.nameText}>
          {profile.first_name || profile.username}{' '}
          {age && <Text style={styles.ageText}>{age}</Text>}
          {profile.is_verified && (
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.verifiedIcon} />
          )}
        </Text>
        
        {profile.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={colors.textLight} />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        )}
      </View>
      
      {/* Badges de statut */}
      <View style={styles.badgesContainer}>
        {profile.is_premium && (
          <View style={[styles.badge, styles.premiumBadge]}>
            <Ionicons name="star" size={14} color={colors.secondary} />
            <Text style={[styles.badgeText, styles.premiumBadgeText]}>Premium</Text>
          </View>
        )}
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getGenderText()}</Text>
        </View>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Cherche: {getSeekingText()}</Text>
        </View>
      </View>
      
      {/* Bio */}
      {profile.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos de moi</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      )}
      
      {/* Intérêts */}
      {interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Centres d'intérêt</Text>
          <View style={styles.interestsContainer}>
            {interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Informations détaillées */}
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
                {profile.profile?.company && (
                  <Text style={styles.infoSubvalue}>chez {profile.profile.company}</Text>
                )}
              </View>
            </View>
          )}
          
          {/* Éducation */}
          {profile.profile?.education && (
            <View style={styles.infoItem}>
              <Ionicons name="school-outline" size={18} color={colors.textLight} />
              <View>
                <Text style={styles.infoLabel}>Éducation</Text>
                <Text style={styles.infoValue}>{getEducationText()}</Text>
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
          
          {/* Statut relationnel */}
          {profile.profile?.relationship_status && (
            <View style={styles.infoItem}>
              <Ionicons name="heart-outline" size={18} color={colors.textLight} />
              <View>
                <Text style={styles.infoLabel}>Statut</Text>
                <Text style={styles.infoValue}>{getRelationshipStatusText()}</Text>
              </View>
            </View>
          )}
          
          {/* Enfants */}
          {profile.profile?.has_children !== null && (
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={18} color={colors.textLight} />
              <View>
                <Text style={styles.infoLabel}>Enfants</Text>
                <Text style={styles.infoValue}>
                  {profile.profile.has_children ? 'Oui' : 'Non'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
      
      {/* Recherche */}
      {profile.profile?.looking_for && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Je recherche</Text>
          <Text style={styles.bioText}>{profile.profile.looking_for}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  ageText: {
    fontSize: 24,
    fontWeight: 'normal',
    color: colors.text,
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: colors.textLight,
    marginLeft: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    color: colors.text,
  },
  premiumBadge: {
    backgroundColor: colors.secondary + '20',
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBadgeText: {
    color: colors.secondary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: colors.primary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    width: '50%',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  infoSubvalue: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
});

export default ProfileInfo;