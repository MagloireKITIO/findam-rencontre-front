// src/screens/discovery/MatchesScreen.js

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
import FilterModal from '../../components/discovery/FilterModal';

const MatchesScreen = () => {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' ou 'likes'
const [showFilterModal, setShowFilterModal] = useState(false);
  // Réinitialiser l'écran lorsqu'il est de nouveau actif
  useFocusEffect(
    React.useCallback(() => {
      loadData();
      return () => {};
    }, [activeTab])
  );

  // Chargement initial des données
  useEffect(() => {
    // Vérifier si la fonction getLikes existe avant de l'appeler
    if (activeTab === 'matches' || (activeTab === 'likes' && 
        typeof apiServices.matchmaking.getLikes === 'function')) {
      loadData();
    } else if (activeTab === 'likes') {
      console.warn("La fonction getLikes n'est pas disponible dans l'API. L'onglet 'Likes reçus' ne fonctionnera pas correctement.");
      setMatches([]);
      setLoading(false);
    }
  }, [activeTab]);

  // Charger les matches ou les likes reçus
  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'matches') {
        await loadMatches();
      } else {
        await loadReceivedLikes();
      }
    } catch (error) {
      console.error(`Erreur lors du chargement des ${activeTab}:`, error);
      Alert.alert('Erreur', `Impossible de charger vos ${activeTab}. Veuillez réessayer.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les matches
  const loadMatches = async () => {
    try {
      const response = await apiServices.matchmaking.getMatches();
      if (response.data && response.data.results) {
        setMatches(response.data.results);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des matches:', error);
      setMatches([]);
      throw error;
    }
  };

  // Charger les likes reçus
  const loadReceivedLikes = async () => {
    try {
      // Essayons d'adapter cette fonction à la structure de votre API
      // Option 1: Utilisation de paramètre de requête
      const response = await apiServices.matchmaking.getLikes('received');
      
      // Option 2: Si votre API a un endpoint direct pour les likes reçus,
      // remplacez la ligne ci-dessus par:
      // const response = await apiClient.get(`${MATCHMAKING_ENDPOINT}/likes/received/`);
      
      if (response.data && response.data.results) {
        setMatches(response.data.results);
      } else if (Array.isArray(response.data)) {
        // Au cas où l'API renvoie directement un tableau
        setMatches(response.data);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des likes reçus:', error);
      setMatches([]);
      // Ne pas propager l'erreur pour éviter de bloquer l'interface
      // throw error;
    }
  };

  // Rafraîchir les données
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
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

 const navigateToConversation = async (matchId, user) => {
  try {
    // Obtenir ou créer une conversation avec cet utilisateur
    const response = await apiServices.messaging.getConversationWithUser(user.id);
    
    if (response.data) {
      // Naviguer vers l'écran de conversation
      // Utiliser la navigation imbriquée pour s'assurer que la tabBar est correctement cachée
      navigation.navigate('Messages', {
        screen: 'Conversation',
        params: {
          conversationId: response.data.id,
          otherUser: user
        },
        initial: false
      });
    } else {
      throw new Error("Impossible de créer une conversation");
    }
  } catch (error) {
    console.error('Erreur lors de la navigation vers la conversation:', error);
    Alert.alert('Erreur', 'Impossible d\'ouvrir la conversation. Veuillez réessayer.');
  }
};

  // Naviguer vers le profil de l'utilisateur
  const navigateToUserProfile = (userId) => {
    // Cette fonction sera implémentée plus tard
    Alert.alert('Information', 'La navigation vers le profil complet sera implémentée prochainement.');
  };

  // Gérer le unmatch
  const handleUnmatch = (matchId) => {
    Alert.alert(
      'Supprimer le match',
      'Êtes-vous sûr de vouloir supprimer ce match ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiServices.matchmaking.unmatch(matchId);
              // Supprimer le match de la liste
              setMatches(matches.filter(match => match.id !== matchId));
            } catch (error) {
              console.error('Erreur lors de la suppression du match:', error);
              Alert.alert('Erreur', 'Impossible de supprimer ce match. Veuillez réessayer.');
            }
          }
        }
      ]
    );
  };

  // Gérer le like (répondre à un like reçu)
  const handleLike = async (likeId, userId) => {
    try {
      await apiServices.matchmaking.likeUser({ liked: userId });
      
      // Actualiser les données après le like
      handleRefresh();
      
      Alert.alert(
  'Nouveau match!',
  'Vous avez un nouveau match! Voulez-vous lui envoyer un message?',
  [
    { 
      text: 'Plus tard', 
      style: 'cancel' 
    },
    { 
      text: 'Envoyer un message', 
      onPress: () => {
        navigateToConversation(null, profile); // Passer l'utilisateur matché
      } 
    }
  ]
);
    } catch (error) {
      console.error('Erreur lors du like:', error);
      Alert.alert('Erreur', 'Impossible de liker cet utilisateur. Veuillez réessayer.');
    }
  };

  // Rendre une carte de match
  const renderMatchItem = ({ item }) => {
    // Déterminer quel utilisateur afficher (pas l'utilisateur actuel)
    let user;
    
    if (activeTab === 'matches') {
      // Si la structure de l'API utilise user1/user2
      if (item.user1 && item.user2) {
        user = item.user1.username === 'me' ? item.user2 : item.user1;
      } 
      // Si la structure de l'API utilise directement matched_user
      else if (item.matched_user) {
        user = item.matched_user;
      }
      // Fallback au cas où la structure serait différente
      else {
        console.warn("Structure de match inconnue:", item);
        return null;
      }
    } else {
      // Likes reçus - vérifier les différentes structures possibles
      if (item.liker) {
        user = item.liker;
      } else if (item.user) {
        user = item.user;
      } else {
        console.warn("Structure de like inconnue:", item);
        return null;
      }
    }
    
    const age = calculateAge(user.date_of_birth);
    
    // Trouver la photo principale ou utiliser la première
    const getProfilePhoto = () => {
      if (!user.photos || user.photos.length === 0) {
        return 'https://via.placeholder.com/400x400/e0e0e0/cccccc?text=No+Photo';
      }
      
      const primaryPhoto = user.photos.find(photo => photo.is_primary);
      return primaryPhoto ? primaryPhoto.image : user.photos[0].image;
    };

    return (
      <View style={styles.matchCard}>
        <TouchableOpacity 
          style={styles.matchPhotoContainer}
          onPress={() => navigateToUserProfile(user.id)}
        >
          <Image 
            source={{ uri: getProfilePhoto() }} 
            style={styles.matchPhoto}
            resizeMode="cover"
          />
          
          {activeTab === 'matches' && (
            <View style={styles.matchBadge}>
              <Ionicons name="heart" size={12} color={colors.textInverted} />
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.matchInfo}>
          <TouchableOpacity onPress={() => navigateToUserProfile(user.id)}>
            <Text style={styles.matchName}>
              {user.first_name || user.username}
              {age && <Text style={styles.matchAge}>, {age}</Text>}
              {user.is_verified && (
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={styles.verifiedIcon} />
              )}
            </Text>
          </TouchableOpacity>
          
          {user.location && (
            <Text style={styles.matchLocation}>
              <Ionicons name="location-outline" size={12} color={colors.textLight} /> {user.location}
            </Text>
          )}
          
          <View style={styles.matchActions}>
            {activeTab === 'matches' ? (
              <>
                <TouchableOpacity 
                  style={[styles.matchButton, styles.messageButton]}
                  onPress={() => navigateToConversation(item.id, user)}
                >
                  <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.unmatchButton}
                  onPress={() => handleUnmatch(item.id)}
                >
                  <Ionicons name="close" size={18} color={colors.textLight} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.matchButton, styles.likeButton]}
                onPress={() => handleLike(item.id, user.id)}
              >
                <Ionicons name="heart-outline" size={16} color={colors.like} />
                <Text style={styles.likeButtonText}>J'aime aussi</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );

  };

  // Afficher un chargement
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          Chargement {activeTab === 'matches' ? 'des matches' : 'des likes'}...
        </Text>
      </View>
    );
  }

  return (
  <View style={styles.container}>
    {/* En-tête */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {activeTab === 'matches' ? 'Mes Matches' : 'Likes reçus'}
      </Text>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Ionicons name="options" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
    
    {/* Modal de filtre */}
    <FilterModal
      visible={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      onApplyFilters={loadData}
    />
      
      {/* Onglets de navigation */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Ionicons 
            name={activeTab === 'matches' ? "heart" : "heart-outline"} 
            size={22} 
            color={activeTab === 'matches' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'matches' && styles.activeTabText
          ]}>
            Matches
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
          onPress={() => setActiveTab('likes')}
        >
          <Ionicons 
            name={activeTab === 'likes' ? "thumbs-up" : "thumbs-up-outline"} 
            size={22} 
            color={activeTab === 'likes' ? colors.primary : colors.textLight} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'likes' && styles.activeTabText
          ]}>
            Likes reçus
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Liste des matches ou likes */}
      <FlatList
        data={matches}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'matches' ? "heart-outline" : "thumbs-up-outline"}
            title={activeTab === 'matches' ? "Pas encore de match" : "Aucun like reçu"}
            message={
              activeTab === 'matches' 
                ? "Continuez à liker des profils pour obtenir des matches."
                : "Personne ne vous a encore liké. Continuez à utiliser l'application pour être plus visible."
            }
            actionText="Découvrir des profils"
            onAction={() => navigation.navigate('Discovery')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.card,
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textLight,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  matchCard: {
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
  matchPhotoContainer: {
    position: 'relative',
  },
  matchPhoto: {
    width: 100,
    height: 120,
  },
  matchBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.like,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  matchAge: {
    fontWeight: 'normal',
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  matchLocation: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 10,
  },
  matchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  messageButton: {
    backgroundColor: colors.primary + '20',
  },
  messageButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  likeButton: {
    backgroundColor: colors.like + '20',
  },
  likeButtonText: {
    color: colors.like,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  unmatchButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default MatchesScreen;