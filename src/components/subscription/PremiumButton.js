// src/components/subscription/PremiumButton.js

import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';

/**
 * Bouton pour accéder à l'écran d'abonnement Premium
 * À placer dans les différents écrans pour promouvoir l'abonnement
 */
const PremiumButton = ({ style, buttonText = 'Passez à Premium' }) => {
  const navigation = useNavigation();

  const goToPremium = () => {
    // Navigation correcte en utilisant le nom de l'onglet et non de l'écran spécifique
    navigation.navigate('Premium');
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={goToPremium}
      activeOpacity={0.8}
    >
      <View style={styles.starContainer}>
        <Ionicons name="star" size={16} color="white" />
      </View>
      <Text style={styles.text}>{buttonText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  starContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  text: {
    color: colors.textInverted,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PremiumButton;