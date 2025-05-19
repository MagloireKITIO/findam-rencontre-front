// src/navigation/ProfileNavigator.js

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import des écrans de profil
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import EditPhotosScreen from '../screens/profile/EditPhotosScreen';
import EditPreferencesScreen from '../screens/profile/EditPreferencesScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';

// Création du navigateur de pile pour le profil
const Stack = createStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'Mon Profil' }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Modifier mon profil' }}
      />
      <Stack.Screen 
        name="EditPhotos" 
        component={EditPhotosScreen} 
        options={{ title: 'Gérer mes photos' }}
      />
      <Stack.Screen 
        name="EditPreferences" 
        component={EditPreferencesScreen} 
        options={{ title: 'Mes préférences' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Paramètres' }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: 'Changer le mot de passe' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;