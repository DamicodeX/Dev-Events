import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images : {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // port: "",
        // pathname: "/dgf6cgt99/**",
      }
    ]
  }
};

export default nextConfig;
