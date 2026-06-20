const replitDomain = process.env.REPLIT_DEV_DOMAIN;

module.exports = {
  expo: {
    name: "Department Connect",
    slug: "department-connect",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "department-connect",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/icon.png",
      resizeMode: "contain",
      backgroundColor: "#2D1B69",
    },
    ios: {
      supportsTablet: false,
    },
    android: {},
    web: {
      favicon: "./assets/images/icon.png",
    },
    plugins: [
      [
        "expo-router",
        {
          origin: "https://replit.com/",
        },
      ],
      "expo-font",
      "expo-web-browser",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {
        origin: replitDomain ? `https://${replitDomain}:8080` : undefined,
        headOrigin: replitDomain ? `https://${replitDomain}:8080` : undefined,
      },
    },
  },
};
