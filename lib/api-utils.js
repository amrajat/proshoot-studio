"use client";

import * as Sentry from "@sentry/nextjs";

/**
 * Handles API fetch requests with improved error handling and retry logic
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} retryDelay - Delay between retries in ms (default: 300)
 * @returns {Promise<Object>} - The response data
 */
export async function fetchWithErrorHandling(
  url,
  options = {},
  retries = 3,
  retryDelay = 300
) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      // Parse JSON response
      const data = await response.json().catch(() => ({}));
      return data;
    } catch (error) {
      lastError = error;

      // Log the error but only to console on retries
      console.error(
        `API request failed (attempt ${attempt + 1}/${retries + 1}):`,
        error
      );

      // Don't retry on client-side validation errors or if we've used all retries
      if (
        error.status === 400 ||
        error.status === 401 ||
        error.status === 403 ||
        attempt === retries
      ) {
        // On final attempt, log to Sentry
        if (attempt === retries) {
          Sentry.captureException(error);
        }
        throw error;
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
    }
  }

  // This should never be reached due to the throw in the loop, but just in case
  throw lastError;
}

/**
 * Handles form submissions with improved error handling
 * @param {string} url - The URL to submit to
 * @param {Object|FormData} data - The data to submit
 * @param {string} method - The HTTP method (default: 'POST')
 * @returns {Promise<Object>} - The response data
 */
export async function submitFormWithErrorHandling(url, data, method = "POST") {
  try {
    const options = {
      method,
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers: {},
    };

    // Don't set Content-Type for FormData as the browser will set it with the boundary
    if (!(data instanceof FormData)) {
      options.headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, options);

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message ||
          `Form submission failed with status ${response.status}`
      );
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Parse JSON response
    const responseData = await response.json().catch(() => ({}));
    return responseData;
  } catch (error) {
    console.error("Form submission error:", error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Safely parses JSON with error handling
 * @param {string} jsonString - The JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} - The parsed object or fallback
 */
export function safeJsonParse(jsonString, fallback = {}) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
