/**
 * Production Monitoring Utilities
 * Minimal, focused monitoring for critical business flows
 */

import * as Sentry from "@sentry/nextjs";

// Studio Creation Flow Monitoring
export const studioMonitoring = {
  // Track when user starts studio creation
  startStudioCreation: (userId, plan) => {
    Sentry.addBreadcrumb({
      message: 'Studio creation started',
      category: 'studio-flow',
      level: 'info',
      data: { userId, plan, timestamp: new Date().toISOString() }
    });
  },

  // Track step progression
  stepCompleted: (step, data = {}) => {
    Sentry.addBreadcrumb({
      message: `Studio step completed: ${step}`,
      category: 'studio-flow',
      level: 'info',
      data: { step, ...data, timestamp: new Date().toISOString() }
    });
  },

  // Track button disable reasons (critical for UX)
  buttonDisabled: (buttonName, reason, context = {}) => {
    Sentry.addBreadcrumb({
      message: `Button disabled: ${buttonName}`,
      category: 'ux-issue',
      level: 'warning',
      data: { 
        buttonName, 
        reason, 
        ...context,
        timestamp: new Date().toISOString()
      }
    });
  },

  // Track upload issues
  uploadIssue: (error, fileInfo = {}) => {
    Sentry.captureException(new Error(`Upload failed: ${error}`), {
      tags: {
        category: 'upload-error',
        critical: 'true'
      },
      extra: {
        fileInfo,
        timestamp: new Date().toISOString()
      }
    });
  },

  // Track payment flow issues
  paymentIssue: (error, paymentData = {}) => {
    Sentry.captureException(new Error(`Payment issue: ${error}`), {
      tags: {
        category: 'payment-error',
        critical: 'true'
      },
      extra: {
        paymentData,
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Performance monitoring for critical operations
export const performanceMonitoring = {
  // Track slow operations
  trackSlowOperation: (operationName, duration, threshold = 5000) => {
    if (duration > threshold) {
      Sentry.addBreadcrumb({
        message: `Slow operation detected: ${operationName}`,
        category: 'performance',
        level: 'warning',
        data: { 
          operationName, 
          duration, 
          threshold,
          timestamp: new Date().toISOString()
        }
      });
    }
  },

  // Track API response times
  trackApiCall: (endpoint, duration, success) => {
    Sentry.addBreadcrumb({
      message: `API call: ${endpoint}`,
      category: 'api',
      level: success ? 'info' : 'error',
      data: { 
        endpoint, 
        duration, 
        success,
        timestamp: new Date().toISOString()
      }
    });
  }
};

// User experience monitoring
export const uxMonitoring = {
  // Track user frustration indicators
  trackUserFrustration: (action, context = {}) => {
    Sentry.addBreadcrumb({
      message: `User frustration indicator: ${action}`,
      category: 'ux-frustration',
      level: 'warning',
      data: { 
        action, 
        ...context,
        timestamp: new Date().toISOString()
      }
    });
  },

  // Track successful completions
  trackSuccess: (flow, data = {}) => {
    Sentry.addBreadcrumb({
      message: `Success: ${flow}`,
      category: 'success',
      level: 'info',
      data: { 
        flow, 
        ...data,
        timestamp: new Date().toISOString()
      }
    });
  }
};
