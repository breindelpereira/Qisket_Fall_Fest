import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qisket.app',
  appName: 'Qisket',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    // Android 15 and later draw apps under the status bar and the navigation buttons. This keeps the app between them,
    // so the header and the bottom tabs are not hidden. Capacitor 8 makes this the default.
    adjustMarginsForEdgeToEdge: 'force',
    backgroundColor: '#170636'
  }
};

export default config;
