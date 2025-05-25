const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const chokidar = require('chokidar');
const config = require('../config/gallery.config.js');

class DevServer {
  constructor() {
    this.app = express();
    this.port = config.gallery.port;
    this.host = config.gallery.host;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWatchers();
  }

  setupMiddleware() {
    // Enable CORS
    this.app.use(cors());
    
    // Parse JSON
    this.app.use(express.json());
    
    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  setupRoutes() {
    // Serve gallery homepage
    this.app.get('/', (req, res) => {
      const galleryPath = path.join(__dirname, '../gallery/index.html');
      if (fs.existsSync(galleryPath)) {
        res.sendFile(path.resolve(galleryPath));
      } else {
        res.send(`
          <html>
            <head><title>Gallery Not Built</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 4rem;">
              <h1>🎨 Gallery Not Built Yet</h1>
              <p>Run <code>npm run setup</code> to fetch examples and build the gallery</p>
              <p>Or <code>npm run build-gallery</code> if you already have examples</p>
            </body>
          </html>
        `);
      }
    });

    // Serve main index.html for each example
    this.app.get('/examples/:exampleName', async (req, res) => {
      const exampleName = req.params.exampleName;
      const examplePath = path.join(__dirname, '../examples', exampleName);
      
      // First, check if the example directory exists
      if (!fs.existsSync(examplePath)) {
        return res.status(404).send(`Example "${exampleName}" not found`);
      }
      
      // Look for built versions first (dist/index.html, build/index.html)
      const distIndexPath = path.join(examplePath, 'dist/index.html');
      const buildIndexPath = path.join(examplePath, 'build/index.html');
      const rootIndexPath = path.join(examplePath, 'index.html');
      
      if (fs.existsSync(distIndexPath)) {
        return res.sendFile(path.resolve(distIndexPath));
      } else if (fs.existsSync(buildIndexPath)) {
        return res.sendFile(path.resolve(buildIndexPath));
      } else if (fs.existsSync(rootIndexPath)) {
        return res.sendFile(path.resolve(rootIndexPath));
      }
      
      // If no index.html found, show directory listing or error
      res.status(404).send(`
        <html>
          <head><title>Example Not Ready</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 4rem;">
            <h1>⚠️ Example "${exampleName}" Not Ready</h1>
            <p>This example might need to be built first.</p>
            <p>Try running: <code>npm run setup-examples</code></p>
            <p><a href="/">← Back to Gallery</a></p>
          </body>
        </html>
      `);
    });

    // Serve static assets from each example's directory
    // This handles assets like CSS, JS, images from dist/, build/, or root
    this.app.get('/examples/:exampleName/*', (req, res) => {
      const exampleName = req.params.exampleName;
      const assetPath = req.params[0]; // Everything after the example name
      const examplePath = path.join(__dirname, '../examples', exampleName);
      
      if (!fs.existsSync(examplePath)) {
        return res.status(404).send(`Example "${exampleName}" not found`);
      }
      
      // Try to serve from different possible locations
      const possiblePaths = [
        path.join(examplePath, 'dist', assetPath),     // Built by Vite
        path.join(examplePath, 'build', assetPath),    // Built by React
        path.join(examplePath, assetPath),             // Root directory
        path.join(examplePath, 'public', assetPath),   // Public assets
        path.join(examplePath, 'static', assetPath)    // Static assets
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath) && fs.statSync(possiblePath).isFile()) {
          return res.sendFile(path.resolve(possiblePath));
        }
      }
      
      // Asset not found
      res.status(404).send(`Asset not found: ${assetPath}`);
    });

    // Serve gallery assets
    this.app.use('/gallery', express.static(path.join(__dirname, '../gallery')));
    
    // API endpoint for metadata
    this.app.get('/api/metadata', async (req, res) => {
      try {
        const metadataPath = config.examples.metadataFile;
        if (await fs.pathExists(metadataPath)) {
          const metadata = await fs.readJSON(metadataPath);
          res.json(metadata);
        } else {
          res.status(404).json({ error: 'Metadata not found' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API endpoint to list examples
    this.app.get('/api/examples', async (req, res) => {
      try {
        const examplesDir = config.examples.baseDir;
        if (await fs.pathExists(examplesDir)) {
          const examples = await this.scanExamples();
          res.json(examples);
        } else {
          res.json([]);
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // 404 handler for all other routes
    this.app.get('*', (req, res) => {
      res.status(404).send(`
        <html>
          <head><title>Not Found</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 4rem;">
            <h1>404 - Not Found</h1>
            <p>The requested resource was not found.</p>
            <p><a href="/">← Back to Gallery</a></p>
          </body>
        </html>
      `);
    });
  }

  async scanExamples() {
    const examplesDir = config.examples.baseDir;
    const examples = [];
    
    if (!await fs.pathExists(examplesDir)) {
      return examples;
    }
    
    const entries = await fs.readdir(examplesDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const examplePath = path.join(examplesDir, entry.name);
        const metadataPath = path.join(examplePath, '.vibe-metadata.json');
        
        let metadata = {
          folder: entry.name,
          title: entry.name,
          description: 'No description available',
          author: 'Unknown',
          tags: [],
          hasIndex: false
        };
        
        // Load metadata if available
        if (await fs.pathExists(metadataPath)) {
          try {
            const fileMetadata = await fs.readJSON(metadataPath);
            metadata = { ...metadata, ...fileMetadata };
          } catch (error) {
            console.warn(`Failed to read metadata for ${entry.name}:`, error.message);
          }
        }
        
        // Check if has index.html
        const indexPath = path.join(examplePath, 'index.html');
        metadata.hasIndex = await fs.pathExists(indexPath);
        
        examples.push(metadata);
      }
    }
    
    return examples;
  }

  setupWatchers() {
    if (config.dev.watchFiles) {
      console.log('👁️  Setting up file watchers...');
      
      // Watch examples list for changes
      chokidar.watch('examples-list.md').on('change', () => {
        console.log('📝 Examples list changed - consider running npm run fetch');
      });
      
      // Watch examples directory
      chokidar.watch('examples/**/*', { ignored: /node_modules/ }).on('change', (filePath) => {
        console.log(`📁 Example file changed: ${filePath}`);
      });
    }
  }

  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, this.host, () => {
        console.log('\n🚀 Development server started!');
        console.log(`📱 Gallery: http://${this.host}:${this.port}`);
        console.log(`📁 Examples: http://${this.host}:${this.port}/examples/`);
        console.log(`🔌 API: http://${this.host}:${this.port}/api/metadata`);
        console.log('\n💡 Tips:');
        console.log('   - Add repositories to examples-list.md');
        console.log('   - Run "npm run fetch" to download new examples');
        console.log('   - Run "npm run build-gallery" to update the gallery');
        console.log('   - Press Ctrl+C to stop the server\n');
        resolve();
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Development server stopped');
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  const server = new DevServer();
  server.start().catch(console.error);
}

module.exports = DevServer; 