// src/screens/discovery/NearbyUsersScreen.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import apiServices from '../../services/api';
import EmptyState from '../../components/common/EmptyState';
import * as Location from 'expo-location';

const NearbyUsersScreen = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Réinitialiser l'écran lorsqu'il est de nouveau actif
  useFocusEffect(
    React.useCallback(() => {
      checkLocationPermission();
      return () => {};
    }, [])
  );

  // Vérifier la permission de localisation
  const checkLocationPermission = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationPermissionGranted(true);
        await updateUserLocation();
        loadNearbyUsers();
      } else {
        setLocationPermissionGranted(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions de localisation:', error);
      setLocationPermissionGranted(false);
      setLoading(false);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Mettre à jour la localisation de l'utilisateur
  const updateUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      await apiServices.profile.updateLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la localisation:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour votre localisation. Veuillez réessayer.');
      return false;
    }
  };

  // Charger les utilisateurs à proximité
  const loadNearbyUsers = async () => {
    setLoading(true);
    try {
      const response = await apiServices.matchmaking.getNearbyUsers();
      if (response.data && response.data.results) {
        setUsers(response.data.results);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs à proximité:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs à proximité. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Rafraîchir les données
  const handleRefresh = async () => {
    setRefreshing(true);
    if (locationPermissionGranted) {
      await updateUserLocation();
      loadNearbyUsers();
    } else {
      checkLocationPermission();
    }
  };

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Formater la distance
  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) {
      return 'Distance inconnue';
    }
    
    if (distance < 1) {
      return 'Moins de 1 km';
    }
    
    return `${Math.round(distance)} km`;
  };

  // Gérer le like d'un utilisateur
  const handleLikeUser = async (userId) => {
    try {
      await apiServices.matchmaking.likeUser({ liked: userId });
      
      // Vérifier s'il y a un match
      const matchResponse = await apiServices.matchmaking.getMatches();
      const matches = matchResponse.data.results || [];
      
      const isMatch = matches.some(match => 
        (match.user1.id === userId || match.user2.id === userId) && 
        match.created_at.startsWith(new Date().toISOString().slice(0, 10))
      );
      
      if (isMatch) {
        const matchedUser = users.find(user => user.id === userId);
        Alert.alert(
          'Nouveau match!',
          `Vous avez matché avec ${matchedUser ? (matchedUser.first_name || matchedUser.username) : 'quelqu\'un'}!`,
          [
            { 
              text: 'Continuer', 
              style: 'cancel' 
            },
            { 
              text: 'Envoyer un message', 
              onPress: () => {
                // Navigation vers la conversation sera implémentée plus tard
              } 
            }
          ]
        );
      }
      
      // Filtrer l'utilisateur liké de la liste
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Erreur lors du like:', error);
      Alert.alert('Erreur', 'Impossible de liker cet utilisateur. Veuillez réessayer.');
    }
  };

  // Naviguer vers le profil d'un utilisateur
  const navigateToUserProfile = (userId) => {
    // Cette fonction sera implémentée plus tard
    Alert.alert('Information', 'La navigation vers le profil complet sera implémentée prochainement.');
  };

  // Rendu d'un élément utilisateur
  const renderUserItem = ({ item }) => {
    const age = calculateAge(item.date_of_birth);
    const distance = formatDistance(item.distance);
    
    // Trouver la photo principale ou utiliser la première
    const getProfilePhoto = () => {
      if (!item.photos || item.photos.length === 0) {
        return 'https://via.placeholder.com/400x400/e0e0e0/cccccc?text=No+Photo';
      }
      
      const primaryPhoto = item.photos.find(photo => photo.is_primary);
      return primaryPhoto ? primaryPhoto.image : item.photos[0].image;
    };
    
    return (
      <TouchableOpacity 
        style={styles.userCard}
        onPress={() => navigateToUserProfile(item.id)}
      >
        <Image 
          source={{ uri: getProfilePhoto() }} 
          style={styles.userPhoto}
          resizeMode="cover"
        />
        
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>
              {item.first_name || item.username}
              {age && <Text style={styles.userAge}>, {age}</Text>}
              {item.is_verified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={styles.verifiedIcon} />
              )}
            </Text>
            <Text style={styles.userDistance}>{distance}</Text>
          </View>
          
          {item.location && (
            <View style={styles.userLocation}>
              <Ionicons name="location-outline" size={16} color={colors.textLight} />
              <Text style={styles.userLocationText}>{item.location}</Text>
            </View>
          )}
          
          {item.bio && (
            <Text style={styles.userBio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
          
          {/* Bouton de like */}
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={() => handleLikeUser(item.id)}
          >
            <Ionicons name="heart-outline" size={24} color={colors.like} />
            <Text style={styles.likeButtonText}>Like</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Afficher un message si la permission de localisation n'est pas accordée
  if (!locationPermissionGranted && !loadingLocation) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="location-off"
          title="Localisation désactivée"
          message="Pour voir les utilisateurs à proximité, veuillez autoriser l'accès à votre localisation."
          actionText="Activer la localisation"
          onAction={checkLocationPermission}
        />
      </View>
    );
  }

  // Afficher un chargement
  if ((loading && !refreshing) || loadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {loadingLocation ? 'Obtention de votre position...' : 'Recherche d\'utilisateurs à proximité...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>À proximité</Text>
      </View>
      
      {/* Liste des utilisateurs */}
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="Personne à proximité"
            message="Nous n'avons trouvé personne à proximité pour le moment. Réessayez plus tard ou modifiez vos préférences de recherche."
            actionText="Rafraîchir"
            onAction={handleRefresh}
          />
        }
      />
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userPhoto: {
    width: 120,
    height: 150,
  },
  userInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  userAge: {
    fontWeight: 'normal',
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  userDistance: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  userLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userLocationText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 4,
  },
  userBio: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.like + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  likeButtonText: {
    color: colors.like,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default NearbyUsersScreen;