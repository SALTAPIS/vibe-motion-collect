module.exports = {
  // Gallery settings
  gallery: {
    title: "Vibe Motion Collect",
    description: "A curated collection of animation examples",
    port: 3000,
    host: "localhost"
  },
  
  // Example settings
  examples: {
    baseDir: "./examples",
    metadataFile: "./config/examples-metadata.json",
    sharedAssetsDir: "./gallery/assets/shared"
  },
  
  // Supported tags for filtering
  tags: {
    libraries: ["threejs", "gsap", "webgl", "css", "canvas", "svg"],
    types: ["particles", "morphing", "scroll", "interactive", "shader", "geometry", "lighting"],
    complexity: ["beginner", "intermediate", "advanced"],
    features: ["audio", "physics", "ai", "procedural", "responsive"]
  },
  
  // Development server settings
  dev: {
    watchFiles: true,
    hotReload: true,
    cors: true
  }
}; 