// Suppress known Expo Go limitations and deprecations for a cleaner testing experience
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('expo-notifications: Android Push notifications')) {
    return; // suppress
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('[expo-av]: Expo AV has been deprecated')) {
    return; // suppress
  }
  if (typeof args[0] === 'string' && args[0].includes('expo-notifications')) {
    return; // suppress
  }
  originalConsoleWarn(...args);
};

// Now import the standard router entry
import 'expo-router/entry';
