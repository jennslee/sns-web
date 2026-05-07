import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.snsanalyzer.app',
  appName: 'SNS Analyzer',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: { launchShowDuration: 1500, backgroundColor: '#030712' },
  },
}

export default config
