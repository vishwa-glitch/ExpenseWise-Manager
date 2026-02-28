require('dotenv').config();

module.exports = {
  expo: {
    name: "Expense Tracker & Budget",
    slug: "fintech",
    version: "1.1.0",
    sdkVersion: "53.0.0",
    jsEngine: "hermes",
    icon: "./assets/icon.png",
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-secure-store",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: "35.0.0",
            minSdkVersion: 24,
            versionCode: 12,
            newArchEnabled: false
          }
        }
      ]
    ],
    owner: "vishwa567",
    android: {
      package: "com.vishwa567.fintech",
      jsEngine: "hermes",
      icon: "./assets/icon.png",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#ffffff"
      }
    },
    extra: {
      eas: {
        projectId: "08cb1df3-0c2c-4482-9bcc-68006b5f2ab8"
      },
      // Environment variables accessible via expo-constants
      API_BASE_URL: process.env.API_BASE_URL,
      API_PREFIX: process.env.API_PREFIX,
      API_TIMEOUT: process.env.API_TIMEOUT,
      ENVIRONMENT: process.env.ENVIRONMENT,
      ENABLE_LOGGING: process.env.ENABLE_LOGGING === 'true',
      ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
    }
  }
};
