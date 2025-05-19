// src/navigation/TabNavigator.js

import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

// Écrans principaux (ils seront créés plus tard)
// Import des écrans à venir:
// import DiscoveryScreen from '../screens/discovery/DiscoveryScreen';
// import NearbyScreen from '../screens/discovery/NearbyScreen';
// import MatchesScreen from '../screens/discovery/MatchesScreen';
// import MessagesScreen from '../screens/messaging/MessagesScreen';
// import EventsScreen from '../screens/events/EventsScreen';
// import ProfileScreen from '../screens/profile/ProfileScreen';

// Création d'un "placeholder" temporaire pour les tests
const PlaceholderScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Écran {route.name}</Text>
  </View>
);

// Création du navigateur par onglets
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
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
        component={PlaceholderScreen} 
        options={{ title: 'Découvrir' }}
      />
      <Tab.Screen 
        name="Nearby" 
        component={PlaceholderScreen} 
        options={{ title: 'À proximité' }}
      />
      <Tab.Screen 
        name="Matches" 
        component={PlaceholderScreen} 
        options={{ title: 'Matchs' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={PlaceholderScreen} 
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Events" 
        component={PlaceholderScreen} 
        options={{ title: 'Événements' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={PlaceholderScreen} 
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;