// src/screens/discovery/DiscoveryScreen.js

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
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import apiServices from '../../services/api';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import ProfileCard from '../../components/discovery/ProfileCard';
import FilterModal from '../../components/discovery/FilterModal';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

const DiscoveryScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);


  // Animations
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  // Réinitialiser l'écran lorsqu'il est de nouveau actif
  useFocusEffect(
    React.useCallback(() => {
      loadProfiles();
      return () => {};
    }, [])
  );

  // Chargement initial des profils
  useEffect(() => {
    loadProfiles();
  }, []);

  // Configurer le PanResponder pour gérer les gestes de swipe
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  // Charger les profils depuis l'API
  const loadProfiles = async () => {
    setLoading(true);
    try {
      const response = await apiServices.matchmaking.getDiscoveryProfiles();
      if (response.data && response.data.results && response.data.results.length > 0) {
        setProfiles(response.data.results);
        setCurrentIndex(0);
        setNoMoreProfiles(false);
        resetPosition();
      } else {
        setProfiles([]);
        setNoMoreProfiles(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error);
      Alert.alert('Erreur', 'Impossible de charger les profils. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Réinitialiser la position de la carte
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false
    }).start();
  };

  // Gérer le swipe à gauche (dislike)
  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -width, y: 0 },
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      handleSwipe('D');
    });
  };

  // Gérer le swipe à droite (like)
  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: width, y: 0 },
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      handleSwipe('L');
    });
  };

  // Gérer le super like
  const handleSuperLike = () => {
    Animated.timing(position, {
      toValue: { x: 0, y: -height },
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      handleSwipe('S');
    });
  };

  // Envoyer l'action de swipe à l'API
  const handleSwipe = async (action) => {
    if (profiles.length <= currentIndex) {
      setNoMoreProfiles(true);
      resetPosition();
      return;
    }

    const currentProfile = profiles[currentIndex];
    
    try {
      // Envoyer l'action de swipe à l'API
      await apiServices.matchmaking.swipe({
        target: currentProfile.id,
        action: action
      });

      // Si c'est un like ou un super like, vérifier s'il y a un match
      if (action === 'L' || action === 'S') {
        await checkForMatch(currentProfile);
      }
    } catch (error) {
      console.error('Erreur lors du swipe:', error);
    }

    // Passer au profil suivant
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= profiles.length) {
        setNoMoreProfiles(true);
      }
      return nextIndex;
    });

    resetPosition();
  };

  // Vérifier s'il y a un match
  const checkForMatch = async (profile) => {
    try {
      const response = await apiServices.matchmaking.getMatches();
      const matches = response.data.results || [];
      
      // Vérifier si le profil actuel est maintenant un match
      const isMatch = matches.some(match => 
        (match.user1.id === profile.id || match.user2.id === profile.id) && 
        match.created_at.startsWith(new Date().toISOString().slice(0, 10))
      );

      if (isMatch) {
        Alert.alert(
          'Nouveau match!',
          `Vous avez matché avec ${profile.first_name || profile.username}!`,
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
    } catch (error) {
      console.error('Erreur lors de la vérification des matchs:', error);
    }
  };

  // Afficher un chargement
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des profils...</Text>
      </View>
    );
  }

  // Afficher un message quand il n'y a plus de profils
  if (noMoreProfiles || profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="search"
          title="Plus de profils"
          message="Nous n'avons plus de profils à vous montrer pour le moment. Réessayez plus tard ou modifiez vos préférences de recherche."
          actionText="Rafraîchir"
          onAction={() => {
            setRefreshing(true);
            loadProfiles();
          }}
        />
      </View>
    );
  }

  // Calculer les styles d'animation pour la carte actuelle
  const cardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotate }
    ]
  };

  // Calcul des opacités pour les badges "Like" et "Nope"
  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const superLikeOpacity = position.y.interpolate({
    inputRange: [-height / 10, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  return (
  <View style={styles.container}>
    {/* En-tête avec bouton de filtre */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Découvrir</Text>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Ionicons name="options" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>

    {/* Modal de filtre */}
    <FilterModal
      visible={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      onApplyFilters={loadProfiles}
    />

      {/* Zone de cartes */}
      <View style={styles.cardContainer}>
        {/* Carte du profil suivant (arrière-plan) */}
        {currentIndex + 1 < profiles.length && (
          <View style={[styles.card, styles.nextCard]}>
            <ProfileCard profile={profiles[currentIndex + 1]} />
          </View>
        )}

        {/* Carte du profil actuel (avant-plan) */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.card, cardStyle]}
        >
          <ProfileCard profile={profiles[currentIndex]} />
          
          {/* Badge "Like" */}
          <Animated.View
            style={[
              styles.badge,
              styles.likeContainer,
              { opacity: likeOpacity }
            ]}
          >
            <Text style={[styles.badgeText, styles.likeText]}>LIKE</Text>
          </Animated.View>

          {/* Badge "Nope" */}
          <Animated.View
            style={[
              styles.badge,
              styles.nopeContainer,
              { opacity: nopeOpacity }
            ]}
          >
            <Text style={[styles.badgeText, styles.nopeText]}>NOPE</Text>
          </Animated.View>

          {/* Badge "Super Like" */}
          <Animated.View
            style={[
              styles.badge,
              styles.superLikeContainer,
              { opacity: superLikeOpacity }
            ]}
          >
            <Text style={[styles.badgeText, styles.superLikeText]}>SUPER LIKE</Text>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Boutons d'action */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={swipeLeft}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={handleSuperLike}
        >
          <Ionicons name="star" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={swipeRight}
        >
          <Ionicons name="heart" size={28} color="white" />
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    width: width - 40,
    height: height * 0.6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  nextCard: {
    top: 10,
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  badge: {
    position: 'absolute',
    padding: 10,
    borderWidth: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeContainer: {
    top: 50,
    right: 40,
    transform: [{ rotate: '30deg' }],
    borderColor: colors.like,
  },
  nopeContainer: {
    top: 50,
    left: 40,
    transform: [{ rotate: '-30deg' }],
    borderColor: colors.dislike,
  },
  superLikeContainer: {
    bottom: 100,
    alignSelf: 'center',
    transform: [{ rotate: '0deg' }],
    borderColor: colors.superLike,
  },
  badgeText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  likeText: {
    color: colors.like,
  },
  nopeText: {
    color: colors.dislike,
  },
  superLikeText: {
    color: colors.superLike,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dislikeButton: {
    backgroundColor: colors.dislike,
  },
  superLikeButton: {
    backgroundColor: colors.superLike,
  },
  likeButton: {
    backgroundColor: colors.like,
  },
});

export default DiscoveryScreen;