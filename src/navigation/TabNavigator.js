// src/navigation/TabNavigator.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

// Import des navigateurs et écrans
import ProfileNavigator from './ProfileNavigator';

// Import des écrans de découverte
import DiscoveryScreen from '../screens/discovery/DiscoveryScreen';
import NearbyUsersScreen from '../screens/discovery/NearbyUsersScreen';
import MatchesScreen from '../screens/discovery/MatchesScreen';

// Placeholder temporaire pour les écrans à implémenter plus tard
const PlaceholderScreen = ({ route }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Écran {route.name}</Text>
    <Text style={styles.placeholderText}>Cet écran sera implémenté dans une phase ultérieure</Text>
  </View>
);

// Création du navigateur par onglets
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  // État pour gérer les badges de notification (sera implémenté plus tard)
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Charger le nombre de messages non lus (sera implémenté plus tard)
  useEffect(() => {
    const loadUnreadCounts = async () => {
      try {
        // Ce code sera implémenté lors de la phase messagerie et notifications
        // const messageResponse = await apiServices.messaging.getUnreadCount();
        // setUnreadMessages(messageResponse.data.count || 0);

        // const notificationResponse = await apiServices.notifications.getNotificationCount();
        // setUnreadNotifications(notificationResponse.data.count || 0);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications non lues:', error);
      }
    };

    // Appeler la fonction
    loadUnreadCounts();

    // Mettre en place un intervalle pour rafraîchir périodiquement
    const interval = setInterval(loadUnreadCounts, 60000); // Toutes les minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Définir l'icône en fonction du nom de la route
          if (route.name === 'Discovery') {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === 'Nearby') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Matches') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Events') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Retourner l'icône Ionicons avec les propriétés spécifiées
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
      })}
    >
      <Tab.Screen 
        name="Discovery" 
        component={DiscoveryScreen} 
        options={{ title: 'Découvrir' }}
      />
      <Tab.Screen 
        name="Nearby" 
        component={NearbyUsersScreen} 
        options={{ title: 'À proximité' }}
      />
      <Tab.Screen 
        name="Matches" 
        component={MatchesScreen} 
        options={{ title: 'Matchs' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={PlaceholderScreen} 
        options={{ 
          title: 'Messages',
          tabBarBadge: unreadMessages > 0 ? unreadMessages : null
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={PlaceholderScreen} 
        options={{ title: 'Événements' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator} 
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default TabNavigator;