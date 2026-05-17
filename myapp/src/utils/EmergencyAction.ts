import { Linking, Platform, Alert } from 'react-native';

export const EmergencyAction = {
  /**
   * Instantly opens the device dialer with the provided number.
   * @param number The emergency phone number to call
   */
  triggerEmergencyCall: async (number: string) => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${number}`;
    } else {
      phoneNumber = `telprompt:${number}`;
    }

    try {
      const supported = await Linking.canOpenURL(phoneNumber);
      if (supported) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert('Error', 'Calling is not supported on this device.');
      }
    } catch (error) {
      console.error('Error triggering emergency call:', error);
      Alert.alert('Error', 'An unexpected error occurred while trying to make a call.');
    }
  },

  /**
   * Instantly opens the device SMS app pre-populated with a specific message and recipient.
   * @param number The recipient's phone number
   * @param message The emergency message to pre-populate
   */
  triggerEmergencyText: async (number: string, message: string) => {
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const smsUrl = `sms:${number}${separator}body=${encodeURIComponent(message)}`;

    try {
      const supported = await Linking.canOpenURL(smsUrl);
      if (supported) {
        await Linking.openURL(smsUrl);
      } else {
        Alert.alert('Error', 'Messaging is not supported on this device.');
      }
    } catch (error) {
      console.error('Error triggering emergency text:', error);
      Alert.alert('Error', 'An unexpected error occurred while trying to send a text.');
    }
  }
};
