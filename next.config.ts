import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to accept requests (including server actions) from
  // devices on the local network. Needed when testing on a phone over Wi-Fi.
  // For tunnels (cloudflared/ngrok), append the generated hostname too.
  allowedDevOrigins: [
    "10.31.39.29",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
