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

// Image Upload Monitoring - Full lifecycle tracking using Sentry Logs
// Logs are always visible in Sentry Logs dashboard, unlike breadcrumbs which only appear with errors
export const uploadMonitoring = {
  // Generate a unique session ID for tracking a batch of uploads
  createUploadSession: (studioId, totalFiles) => {
    const sessionId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    Sentry.logger.info('Upload session started', {
      sessionId,
      studioId,
      totalFiles,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      onLine: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
    });
    
    return sessionId;
  },

  // Track when files are dropped/selected
  filesDropped: (sessionId, files) => {
    Sentry.logger.info('Files dropped', {
      sessionId,
      fileCount: files.length,
      totalSizeMB: (files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2),
      fileNames: files.map(f => f.name).join(', '),
    });
  },

  // Track files rejected by dropzone
  filesRejected: (sessionId, rejectedFiles) => {
    Sentry.logger.warn('Files rejected by dropzone', {
      sessionId,
      rejectedCount: rejectedFiles.length,
      files: rejectedFiles.map(({ file, errors }) => ({
        name: file.name,
        errors: errors.map(e => e.code).join(', '),
      })),
    });
  },

  // Track duplicate file detection
  duplicatesDetected: (sessionId, duplicateNames, uniqueCount) => {
    Sentry.logger.info('Duplicate files detected', {
      sessionId,
      duplicateCount: duplicateNames.length,
      duplicateNames: duplicateNames.join(', '),
      uniqueFilesProceeding: uniqueCount,
    });
  },

  // Track image processing start
  processingStarted: (sessionId, fileId, fileName, fileSize, fileType) => {
    Sentry.logger.info('File processing started', {
      sessionId,
      fileId,
      fileName,
      fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
      fileType,
    });
  },

  // Track HEIC conversion
  heicConversionStarted: (sessionId, fileId, fileName) => {
    Sentry.logger.info('HEIC conversion started', {
      sessionId,
      fileId,
      fileName,
    });
  },

  heicConversionCompleted: (sessionId, fileId, fileName, durationMs) => {
    Sentry.logger.info('HEIC conversion completed', {
      sessionId,
      fileId,
      fileName,
      durationMs,
    });
  },

  heicConversionFailed: (sessionId, fileId, fileName, error) => {
    Sentry.logger.error('HEIC conversion failed', {
      sessionId,
      fileId,
      fileName,
      errorMessage: error?.message || String(error),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      onLine: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
      deviceMemory: typeof navigator !== 'undefined' ? navigator.deviceMemory : 'unknown',
    });
    
    // Also capture as exception for Issues visibility
    Sentry.captureException(new Error(`HEIC conversion failed: ${fileName}`), {
      tags: { category: 'upload-heic-error' },
      extra: { 
        sessionId, 
        fileId, 
        fileName, 
        errorMessage: error?.message,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      },
    });
  },

  // Track HEIC conversion auto-retry
  heicConversionRetry: (sessionId, fileName, attemptNumber, maxRetries, errorMessage) => {
    Sentry.logger.warn('HEIC conversion auto-retry', {
      sessionId,
      fileName,
      attemptNumber,
      maxRetries,
      errorMessage,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      deviceMemory: typeof navigator !== 'undefined' ? navigator.deviceMemory : 'unknown',
    });
  },

  // Track presigned URL request
  presignedUrlRequested: (sessionId, fileId, fileName) => {
    Sentry.logger.info('Presigned URL requested', {
      sessionId,
      fileId,
      fileName,
    });
  },

  presignedUrlReceived: (sessionId, fileId, fileName, durationMs) => {
    Sentry.logger.info('Presigned URL received', {
      sessionId,
      fileId,
      fileName,
      durationMs,
    });
  },

  presignedUrlFailed: (sessionId, fileId, fileName, error, httpStatus) => {
    Sentry.logger.error('Presigned URL request failed', {
      sessionId,
      fileId,
      fileName,
      httpStatus,
      errorMessage: error?.message || String(error),
      onLine: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
    });
    
    // Also capture as exception for Issues visibility
    Sentry.captureException(new Error(`Presigned URL failed: ${fileName}`), {
      tags: { category: 'upload-presigned-error', httpStatus: String(httpStatus || 'unknown') },
      extra: { sessionId, fileId, fileName, httpStatus, errorMessage: error?.message },
    });
  },

  // Track R2 upload
  r2UploadStarted: (sessionId, fileId, fileName, fileSize) => {
    Sentry.logger.info('R2 upload started', {
      sessionId,
      fileId,
      fileName,
      fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
    });
  },

  r2UploadProgress: (sessionId, fileId, fileName, progress) => {
    // Only log at 50% to reduce noise
    if (progress === 50) {
      Sentry.logger.info('R2 upload progress 50%', {
        sessionId,
        fileId,
        fileName,
      });
    }
  },

  r2UploadCompleted: (sessionId, fileId, fileName, fileSize, durationMs) => {
    const speedMBps = fileSize / (1024 * 1024) / (durationMs / 1000);
    
    Sentry.logger.info('R2 upload completed', {
      sessionId,
      fileId,
      fileName,
      fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
      durationMs,
      speedMBps: speedMBps.toFixed(2),
    });
  },

  r2UploadFailed: (sessionId, fileId, fileName, fileSize, error, xhrStatus, xhrStatusText, durationMs) => {
    Sentry.logger.error('R2 upload failed', {
      sessionId,
      fileId,
      fileName,
      fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
      xhrStatus,
      xhrStatusText,
      durationMs,
      errorMessage: error?.message || String(error),
      onLine: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
      connectionType: typeof navigator !== 'undefined' && navigator.connection 
        ? navigator.connection.effectiveType 
        : 'unknown',
    });
    
    // Also capture as exception for Issues visibility
    Sentry.captureException(new Error(`R2 upload failed: ${fileName}`), {
      tags: { category: 'upload-r2-error', xhrStatus: String(xhrStatus || 'unknown') },
      extra: { sessionId, fileId, fileName, xhrStatus, xhrStatusText, durationMs, errorMessage: error?.message },
    });
  },

  // Track upload session completion
  uploadSessionCompleted: (sessionId, studioId, stats) => {
    if (stats.failedCount > 0) {
      Sentry.logger.warn('Upload session completed with failures', {
        sessionId,
        studioId,
        totalFiles: stats.totalFiles,
        successCount: stats.successCount,
        failedCount: stats.failedCount,
        totalDurationMs: stats.totalDurationMs,
        successRate: ((stats.successCount / stats.totalFiles) * 100).toFixed(1) + '%',
      });
      
      // Capture as exception for visibility
      Sentry.captureException(new Error(`Upload session had failures: ${stats.failedCount}/${stats.totalFiles}`), {
        tags: { category: 'upload-session-partial-failure' },
        extra: { sessionId, studioId, ...stats },
      });
    } else {
      Sentry.logger.info('Upload session completed successfully', {
        sessionId,
        studioId,
        totalFiles: stats.totalFiles,
        successCount: stats.successCount,
        totalDurationMs: stats.totalDurationMs,
      });
    }
  },

  // Track manual retry attempts (user clicked retry button)
  retryAttempted: (sessionId, fileId, fileName, attemptNumber) => {
    Sentry.logger.warn('Upload manual retry attempted', {
      sessionId,
      fileId,
      fileName,
      attemptNumber,
    });
  },

  // Track auto-retry attempts for uploads
  uploadAutoRetry: (sessionId, fileId, fileName, attemptNumber, maxRetries, errorMessage) => {
    Sentry.logger.warn('Upload auto-retry', {
      sessionId,
      fileId,
      fileName,
      attemptNumber,
      maxRetries,
      errorMessage,
      onLine: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
      connectionType: typeof navigator !== 'undefined' && navigator.connection 
        ? navigator.connection.effectiveType 
        : 'unknown',
    });
  },
  
  // Track any upload failure caught in the main catch block
  uploadFailed: (sessionId, fileId, fileName, error, stage) => {
    Sentry.logger.error('Upload failed', {
      sessionId,
      fileId,
      fileName,
      stage,
      errorMessage: error?.message || String(error),
      onLine: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
    });
    
    // Always capture as exception so it appears in Issues
    Sentry.captureException(new Error(`Upload failed at ${stage}: ${fileName}`), {
      tags: { category: 'upload-error', stage },
      extra: { sessionId, fileId, fileName, errorMessage: error?.message },
    });
  },
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
