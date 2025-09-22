import { Platform } from 'react-native';

// --- DEVELOPMENT CONFIGURATION ---
// This file is for local development ONLY.

// Replace with your computer's local IP address.
// On Windows, run `ipconfig` in your terminal.
// This allows your Expo Go app on your phone to connect to the local backend.
const LOCAL_DEV_IP = '192.168.1.4'; // <-- IMPORTANT: REPLACE WITH YOUR IP

// The port your local backend is running on.
const LOCAL_DEV_PORT = 3000;

/**
 * Determines the API host URL based on the platform.
 * For physical devices (Expo Go), it's crucial to use the computer's local network IP.
 * 'localhost' will not work as the phone is a separate device on the network.
 */
const getApiHost = () => {
  // For both Android and iOS physical devices, we use the local IP.
  return `http://${LOCAL_DEV_IP}:${LOCAL_DEV_PORT}`;
};

export const getDevApiUrl = (): string => {
  return getApiHost();
};
