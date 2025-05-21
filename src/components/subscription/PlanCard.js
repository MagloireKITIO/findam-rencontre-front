// src/components/subscription/PlanCard.js

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

/**
 * Composant pour afficher un plan d'abonnement
 * 
 * @param {Object} plan - Données du plan d'abonnement
 * @param {boolean} isSelected - Si le plan est sélectionné
 * @param {function} onSelect - Fonction à appeler lors de la sélection du plan
 */
const PlanCard = ({ plan, isSelected, onSelect }) => {
  // Formatage du prix
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Calculer le prix par mois
  const getMonthlyPrice = () => {
    switch(plan.duration) {
      case 'MONTHLY':
        return plan.price;
      case 'BIANNUAL':
        return Math.round(plan.price / 6);
      case 'ANNUAL':
        return Math.round(plan.price / 12);
      default:
        return plan.price;
    }
  };

  // Obtenir l'économie en pourcentage
  const getSavingsPercentage = () => {
    const monthlyPrice = getMonthlyPrice();
    const standardMonthlyPlan = plan.price; // On présume que le premier plan est mensuel standard
    
    if (plan.duration === 'MONTHLY') return null;
    
    const savings = 100 - (monthlyPrice / standardMonthlyPlan * 100);
    return Math.round(savings);
  };

  // Obtenir la durée en texte
  const getDurationText = () => {
    switch(plan.duration) {
      case 'MONTHLY':
        return '1 mois';
      case 'BIANNUAL':
        return '6 mois';
      case 'ANNUAL':
        return '12 mois';
      default:
        return plan.duration;
    }
  };

  // Afficher le badge "populaire" si applicable
  const renderPopularBadge = () => {
    if (plan.popular) {
      return (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Populaire</Text>
        </View>
      );
    }
    return null;
  };

  // Afficher les fonctionnalités du plan
  const renderFeatures = () => {
    if (!plan.features || !Array.isArray(plan.features)) {
      return null;
    }

    return (
      <View style={styles.featuresList}>
        {plan.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark" size={16} color={colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        {plan.features.length > 3 && (
          <Text style={styles.moreFeatures}>+ {plan.features.length - 3} autres avantages</Text>
        )}
      </View>
    );
  };

  // Afficher l'économie réalisée
  const renderSavings = () => {
    const savings = getSavingsPercentage();
    
    if (!savings) return null;
    
    return (
      <View style={styles.savingsContainer}>
        <Text style={styles.savingsText}>Économisez {savings}%</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {renderPopularBadge()}
      
      <View style={styles.header}>
        <Text style={styles.title}>{plan.name}</Text>
        <Text style={styles.duration}>{getDurationText()}</Text>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formatPrice(plan.price)}</Text>
        {plan.duration !== 'MONTHLY' && (
          <Text style={styles.monthlyPrice}>
            soit {formatPrice(getMonthlyPrice())}/mois
          </Text>
        )}
      </View>
      
      {renderSavings()}
      {renderFeatures()}
      
      <View style={styles.selectionArea}>
        <View style={[
          styles.radioButton,
          isSelected && styles.radioButtonSelected
        ]}>
          {isSelected && (
            <View style={styles.radioInner} />
          )}
        </View>
        <Text style={[
          styles.selectText,
          isSelected && styles.selectTextSelected
        ]}>
          {isSelected ? 'Sélectionné' : 'Sélectionner'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  selectedContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primary + '05',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  popularText: {
    color: colors.textInverted,
    fontWeight: 'bold',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  duration: {
    fontSize: 14,
    color: colors.textLight,
  },
  priceContainer: {
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  monthlyPrice: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  savingsContainer: {
    backgroundColor: colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  savingsText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: 'bold',
  },
  featuresList: {
    marginTop: 10,
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  moreFeatures: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
    marginLeft: 24,
  },
  selectionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  selectText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 8,
  },
  selectTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default PlanCard;