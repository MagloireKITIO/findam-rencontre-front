// src/screens/messaging/ConversationsScreen.js

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

const ConversationsScreen = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Réinitialiser l'écran lorsqu'il est de nouveau actif
  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
      return () => {};
    }, [])
  );

  // Charger les conversations
  const loadConversations = async () => {
    setLoading(true);
    try {
      const response = await apiServices.messaging.getConversations();
      if (response.data && response.data.results) {
        setConversations(response.data.results);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      Alert.alert('Erreur', 'Impossible de charger vos conversations. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Rafraîchir les conversations
  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  // Naviguer vers une conversation
  const navigateToConversation = (conversationId, otherUser) => {
    navigation.navigate('Conversation', { 
      conversationId, 
      otherUser 
    });
  };

  // Formater la date du dernier message
  const formatLastMessageTime = (dateString) => {
    if (!dateString) return '';
    
    const messageDate = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Aujourd'hui, afficher l'heure
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      // Hier
      return 'Hier';
    } else if (diffInDays < 7) {
      // Cette semaine, afficher le jour
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      return days[messageDate.getDay()];
    } else {
      // Plus ancien, afficher la date
      return messageDate.toLocaleDateString();
    }
  };

  // Rendre un élément de conversation
  const renderConversationItem = ({ item }) => {
    const otherUser = item.other_participant;
    
    if (!otherUser) {
      return null; // Ne pas afficher si l'autre utilisateur n'est pas défini
    }
    
    // Trouver la photo de profil de l'autre utilisateur
    const getProfilePhoto = () => {
      if (!otherUser.profile_picture) {
        return 'https://via.placeholder.com/100x100/e0e0e0/cccccc?text=No+Photo';
      }
      return otherUser.profile_picture;
    };
    
    const lastMessage = item.last_message || {};
    const unreadCount = item.unread_count || 0;
    
    return (
      <TouchableOpacity 
        style={styles.conversationItem}
        onPress={() => navigateToConversation(item.id, otherUser)}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: getProfilePhoto() }} 
            style={styles.avatar}
            resizeMode="cover"
          />
          {otherUser.is_online && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        
        <View style={styles.conversationDetails}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>
              {otherUser.first_name || otherUser.username}
              {otherUser.is_verified && (
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={styles.verifiedIcon} />
              )}
            </Text>
            <Text style={styles.messageTime}>
              {formatLastMessageTime(lastMessage.created_at)}
            </Text>
          </View>
          
          <View style={styles.messagePreviewContainer}>
            <Text 
              style={[
                styles.messagePreview,
                unreadCount > 0 && styles.unreadMessagePreview
              ]}
              numberOfLines={1}
            >
              {lastMessage.content || "Démarrer une conversation"}
            </Text>
            
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Afficher un chargement
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      {/* Liste des conversations */}
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title="Aucune conversation"
            message="Vous n'avez pas encore de conversation. Commencez par matcher avec d'autres utilisateurs pour pouvoir discuter avec eux."
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
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  conversationDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    fontSize: 14,
    color: colors.textLight,
    flex: 1,
    marginRight: 8,
  },
  unreadMessagePreview: {
    color: colors.text,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: colors.textInverted,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ConversationsScreen;