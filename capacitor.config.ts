import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qisket.app',
  appName: 'Qisket',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
