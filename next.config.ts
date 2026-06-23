import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Este proyecto vive anidado dentro de otro repo. Fijamos la raíz de
  // Turbopack para que no infiera mal el workspace por lockfiles vecinos.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
