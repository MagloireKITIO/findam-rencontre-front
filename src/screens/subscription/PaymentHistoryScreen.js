// src/screens/subscription/PaymentHistoryScreen.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import apiServices from '../../services/api';
import EmptyState from '../../components/common/EmptyState';

const PaymentHistoryScreen = () => {
  const navigation = useNavigation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger l'historique des paiements au montage
  useEffect(() => {
    loadPayments();
  }, []);

  // Charger les paiements
  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await apiServices.subscriptions.getPayments();
      if (response.data && response.data.results) {
        setPayments(response.data.results);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des paiements:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique des paiements. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Rafraîchir les paiements
  const handleRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  // Formater le prix pour l'affichage
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'FAILED':
      case 'CANCELLED':
        return colors.error;
      default:
        return colors.textLight;
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'Réussi';
      case 'PENDING':
        return 'En attente';
      case 'FAILED':
        return 'Échoué';
      case 'CANCELLED':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Obtenir l'icône de la méthode de paiement
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'CM_MOBILE':
        return 'phone-portrait-outline';
      case 'CM_MTN':
        return 'logo-google';
      case 'CM_ORANGE':
        return 'logo-google';
      case 'CARD':
        return 'card-outline';
      case 'PAYPAL':
        return 'logo-paypal';
      default:
        return 'cash-outline';
    }
  };

  // Obtenir le nom de la méthode de paiement
  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'CM_MOBILE':
        return 'Mobile Money';
      case 'CM_MTN':
        return 'MTN Mobile Money';
      case 'CM_ORANGE':
        return 'Orange Money';
      case 'CARD':
        return 'Carte bancaire';
      case 'PAYPAL':
        return 'PayPal';
      default:
        return 'Autre';
    }
  };

  // Vérifier le paiement
  const verifyPayment = async (payment) => {
    // Ne vérifier que les paiements en attente
    if (payment.status !== 'PENDING') return;

    try {
      const response = await apiServices.subscriptions.verifyPayment({
        payment_reference: payment.reference
      });
      
      if (response.data && response.data.payment.status !== payment.status) {
        // Rafraîchir la liste des paiements si le statut a changé
        loadPayments();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
    }
  };

  // Afficher les détails d'un paiement
  const showPaymentDetails = (payment) => {
    Alert.alert(
      'Détails du paiement',
      `Référence: ${payment.reference}\n`+
      `Status: ${getStatusText(payment.status)}\n`+
      `Montant: ${formatPrice(payment.amount)}\n`+
      `Méthode: ${getPaymentMethodName(payment.payment_method)}\n`+
      `Date: ${formatDate(payment.transaction_date || payment.created_at)}\n`+
      `Type: ${payment.payment_type}`,
      [{ text: 'OK' }]
    );
  };

  // Rendre un élément de paiement
  const renderPaymentItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.paymentItem}
        onPress={() => showPaymentDetails(item)}
      >
        <View style={styles.paymentIconContainer}>
          <Ionicons 
            name={getPaymentMethodIcon(item.payment_method)} 
            size={24} 
            color={colors.text} 
          />
        </View>
        
        <View style={styles.paymentDetails}>
          <View style={styles.paymentHeader}>
            <Text style={styles.paymentType}>
              {item.payment_type === 'SUBSCRIPTION' ? 'Abonnement' : item.payment_type}
            </Text>
            <Text style={styles.paymentAmount}>
              {formatPrice(item.amount)}
            </Text>
          </View>
          
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentReference}>
              Ref: {item.reference.substring(0, 12)}...
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(item.status) }
              ]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.paymentFooter}>
            <Text style={styles.paymentDate}>
              {formatDate(item.transaction_date || item.created_at)}
            </Text>
            
            {item.status === 'PENDING' && (
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={() => verifyPayment(item)}
              >
                <Text style={styles.verifyText}>Vérifier</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Afficher un loading
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de l'historique des paiements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique des paiements</Text>
        <View style={styles.emptySpace} />
      </View>

      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Aucun paiement"
            message="Vous n'avez effectué aucun paiement pour le moment."
            actionText="Découvrir Premium"
            onAction={() => navigation.navigate('SubscriptionPlans')}
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
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  paymentItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  paymentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentReference: {
    fontSize: 14,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  verifyButton: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifyText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default PaymentHistoryScreen;