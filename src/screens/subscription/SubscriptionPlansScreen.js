// src/screens/subscription/SubscriptionPlansScreen.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import apiServices from '../../services/api';
import Button from '../../components/common/Button';
import PlanCard from '../../components/subscription/PlanCard';

const SubscriptionPlansScreen = () => {
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(false);

  // Charger les plans et le statut d'abonnement au montage
  useEffect(() => {
    loadData();
  }, []);

  // Charger les données des plans et de l'abonnement actif
  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les plans d'abonnement
      const plansResponse = await apiServices.subscriptions.getSubscriptionPlans();
      
      if (plansResponse.data) {
        const sortedPlans = plansResponse.data.sort((a, b) => a.price - b.price);
        setPlans(sortedPlans);
      }

      // Vérifier si l'utilisateur a déjà un abonnement actif
      const statusResponse = await apiServices.subscriptions.getSubscriptionStatus();
      
      if (statusResponse.data) {
        if (statusResponse.data.is_premium) {
          setActiveSubscription(statusResponse.data.subscription);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des plans d\'abonnement:', error);
      Alert.alert('Erreur', 'Impossible de charger les plans d\'abonnement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Sélectionner un plan
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  // Continuer avec le plan sélectionné
  const handleContinue = () => {
    if (!selectedPlan) {
      Alert.alert('Sélection requise', 'Veuillez sélectionner un plan d\'abonnement pour continuer.');
      return;
    }

    navigation.navigate('PaymentMethods', { plan: selectedPlan });
  };

  // Annuler un abonnement
  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;

    Alert.alert(
      'Annuler l\'abonnement',
      'Êtes-vous sûr de vouloir désactiver le renouvellement automatique ? Vous pourrez utiliser votre abonnement jusqu\'à sa date d\'expiration.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          style: 'destructive',
          onPress: async () => {
            setProcessingPlan(true);
            try {
              await apiServices.subscriptions.cancelActiveSubscription({
                subscription_id: activeSubscription.id
              });
              
              // Rafraîchir les données
              loadData();
              
              Alert.alert(
                'Abonnement annulé',
                'Le renouvellement automatique a été désactivé. Votre abonnement restera actif jusqu\'au ' + 
                new Date(activeSubscription.end_date).toLocaleDateString()
              );
            } catch (error) {
              console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
              Alert.alert('Erreur', 'Impossible d\'annuler l\'abonnement. Veuillez réessayer.');
            } finally {
              setProcessingPlan(false);
            }
          }
        }
      ]
    );
  };

  // Afficher un message de chargement
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des plans d'abonnement...</Text>
      </View>
    );
  }

  // Afficher les informations de l'abonnement actif
  if (activeSubscription) {
    const endDate = new Date(activeSubscription.end_date);
    const daysLeft = activeSubscription.days_left;
    const autoRenew = activeSubscription.auto_renew;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Votre Abonnement</Text>
          <View style={styles.emptySpace} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.premiumBadgeContainer}>
            <Image 
              source={require('../../../assets/premium-badge.png')} 
              style={styles.premiumBadge}
              resizeMode="contain"
            />
            <Text style={styles.activePlanTitle}>Findam Premium</Text>
            <Text style={styles.activePlanSubtitle}>{activeSubscription.plan}</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>État</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Actif</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date d'expiration</Text>
              <Text style={styles.infoValue}>{endDate.toLocaleDateString()}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jours restants</Text>
              <Text style={styles.infoValue}>{daysLeft} jours</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Renouvellement automatique</Text>
              <Text style={[
                styles.infoValue, 
                autoRenew ? styles.enabledText : styles.disabledText
              ]}>
                {autoRenew ? 'Activé' : 'Désactivé'}
              </Text>
            </View>
          </View>

          <Text style={styles.benefitsTitle}>Vos avantages Premium</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="infinite" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Likes illimités</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="eye" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Voir qui vous a liké</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="star" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>5 Super Likes par jour</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="location" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Recherche dans le monde entier</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="options" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Filtres de recherche avancés</Text>
            </View>
          </View>

          {processingPlan ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator size="small" color={colors.textInverted} />
            </View>
          ) : (
            autoRenew && (
              <Button
                variant="outlined"
                label="Désactiver le renouvellement automatique"
                onPress={handleCancelSubscription}
                style={styles.cancelButton}
              />
            )
          )}

          <Button
            variant="secondary"
            label="Changer de plan"
            onPress={() => setActiveSubscription(null)}
            style={styles.changeButton}
          />
        </ScrollView>
      </View>
    );
  }

  // Afficher la sélection de plans
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium</Text>
        <View style={styles.emptySpace} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Image 
            source={require('../../../assets/premium-hero.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>Passez à Findam Premium</Text>
          <Text style={styles.heroSubtitle}>
            Maximisez vos chances de rencontres et accédez à toutes les fonctionnalités premium
          </Text>
        </View>

        <Text style={styles.plansTitle}>Choisissez votre plan</Text>

        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan && selectedPlan.id === plan.id}
            onSelect={() => handleSelectPlan(plan)}
          />
        ))}

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Avantages Premium</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Ionicons name="infinite" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Likes illimités</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="eye" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Voir qui vous a liké</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="star" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>5 Super Likes par jour</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="location" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Recherche dans le monde entier</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="options" size={24} color={colors.primary} />
              <Text style={styles.benefitText}>Filtres de recherche avancés</Text>
            </View>
          </View>
        </View>

        <Button
          variant="primary"
          label="Continuer"
          onPress={handleContinue}
          disabled={!selectedPlan}
          style={styles.continueButton}
        />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptySpace: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  benefitsSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  benefitsList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 10,
  },
  continueButton: {
    marginTop: 20,
  },
  premiumBadgeContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  premiumBadge: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  activePlanTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  activePlanSubtitle: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textLight,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: colors.success + '20',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: colors.success,
    fontWeight: 'bold',
  },
  enabledText: {
    color: colors.success,
  },
  disabledText: {
    color: colors.error,
  },
  cancelButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  changeButton: {
    marginBottom: 20,
  },
  loadingButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
});

export default SubscriptionPlansScreen;