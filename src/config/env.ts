const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Frontend App",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  ),
} as const;

export { env };
