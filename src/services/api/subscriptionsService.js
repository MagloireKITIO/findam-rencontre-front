// src/services/api/subscriptionsService.js

import apiClient from './client';
import { config } from '../../constants/config';

const SUBSCRIPTIONS_ENDPOINT = config.API_ENDPOINTS.SUBSCRIPTIONS;

/**
 * Service gérant les appels API liés aux abonnements et paiements
 */
const subscriptionsService = {
  /**
   * Récupère les plans d'abonnement disponibles
   * @returns {Promise} - Résultat de la requête
   */
  getSubscriptionPlans: () => {
    return apiClient.get(`${SUBSCRIPTIONS_ENDPOINT}/plans/`);
  },

  /**
   * Récupère les détails d'un plan spécifique
   * @param {number} planId - ID du plan
   * @returns {Promise} - Résultat de la requête
   */
  getPlanDetails: (planId) => {
    return apiClient.get(`${SUBSCRIPTIONS_ENDPOINT}/plans/${planId}/`);
  },

  /**
   * Récupère les abonnements de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getUserSubscriptions: () => {
    return apiClient.get(`${SUBSCRIPTIONS_ENDPOINT}/subscriptions/`);
  },

  /**
   * Récupère l'abonnement actif de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getActiveSubscription: () => {
    return apiClient.get(`${SUBSCRIPTIONS_ENDPOINT}/subscriptions/active/`);
  },

  /**
   * Annule un abonnement
   * @param {number} subscriptionId - ID de l'abonnement
   * @returns {Promise} - Résultat de la requête
   */
  cancelSubscription: (subscriptionId) => {
    return apiClient.post(`${SUBSCRIPTIONS_ENDPOINT}/subscriptions/${subscriptionId}/cancel/`);
  },

  /**
   * Récupère l'historique des paiements
   * @returns {Promise} - Résultat de la requête
   */
  getPayments: () => {
    return apiClient.get(`${SUBSCRIPTIONS_ENDPOINT}/payments/`);
  },

  /**
   * Initie un paiement pour un abonnement
   * @param {Object} paymentData - Données du paiement
   * @returns {Promise} - Résultat de la requête
   */
  initiatePayment: (paymentData) => {
    return apiClient.post(`${SUBSCRIPTIONS_ENDPOINT}/initiate-payment/`, paymentData);
  },

  /**
   * Vérifie le statut d'un paiement
   * @param {Object} verificationData - Données de vérification
   * @returns {Promise} - Résultat de la requête
   */
  verifyPayment: (verificationData) => {
    return apiClient.post(`${SUBSCRIPTIONS_ENDPOINT}/verify-payment/`, verificationData);
  },

  /**
   * Annule un abonnement actif
   * @param {Object} cancellationData - Données d'annulation
   * @returns {Promise} - Résultat de la requête
   */
  cancelActiveSubscription: (cancellationData) => {
    return apiClient.post(`${SUBSCRIPTIONS_ENDPOINT}/cancel-subscription/`, cancellationData);
  },

  /**
   * Récupère le statut d'abonnement de l'utilisateur
   * @returns {Promise} - Résultat de la requête
   */
  getSubscriptionStatus: () => {
    return apiClient.get(`${SUBSCRIPTIONS_ENDPOINT}/status/`);
  }
};

export default subscriptionsService;