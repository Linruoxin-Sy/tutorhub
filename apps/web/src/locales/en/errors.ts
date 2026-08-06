export default {
  http: {
    '400': 'Bad request. Please check your input.',
    '403': 'Permission denied. You cannot perform this action.',
    '404': 'The requested resource was not found.',
    '409': 'Data conflict. Please refresh and try again.',
    '422': 'Request validation failed.',
    '429': 'Too many requests. Please try again later.',
    '500': 'Internal server error. Please try again later.',
    '502': 'Bad gateway. Please try again later.',
    '503': 'Service temporarily unavailable. Please try again later.',
  },
  network: {
    ERR_NETWORK: 'Network connection failed. Please check your network.',
    ECONNABORTED: 'Request timed out. Please try again.',
    ERR_CANCELED: 'Request cancelled.',
  },
  requestFailed: 'Request failed ({status})',
  unknown: 'An unknown error occurred.',
  sessionExpired: 'Session expired. Please log in again.',
  failedToLoad: 'Failed to load data',
};
