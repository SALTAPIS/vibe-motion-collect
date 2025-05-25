const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const config = require('../config/gallery.config.js');

class ExampleSetup {
  constructor() {
    this.examplesDir = config.examples.baseDir;
    this.builtExamples = [];
    this.failedExamples = [];
  }

  async runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
      console.log(`   Running: ${command} ${args.join(' ')}`);
      const child = spawn(command, args, { 
        cwd, 
        stdio: 'pipe',
        shell: true 
      });
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}:\n${errorOutput}`));
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async detectProjectType(examplePath) {
    const packageJsonPath = path.join(examplePath, 'package.json');
    const indexHtmlPath = path.join(examplePath, 'index.html');
    
    // Check if it has package.json (needs building)
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJSON(packageJsonPath);
      
      // Detect project type based on dependencies and scripts
      if (packageJson.dependencies?.['react'] || packageJson.dependencies?.['react-dom']) {
        return { type: 'react', packageJson };
      } else if (packageJson.dependencies?.['vite'] || packageJson.devDependencies?.['vite']) {
        return { type: 'vite', packageJson };
      } else if (packageJson.scripts?.['build']) {
        return { type: 'buildable', packageJson };
      } else {
        return { type: 'node', packageJson };
      }
    }
    
    // Check if it has index.html (static)
    if (await fs.pathExists(indexHtmlPath)) {
      return { type: 'static' };
    }
    
    return { type: 'unknown' };
  }

  async setupExample(exampleName) {
    const examplePath = path.join(this.examplesDir, exampleName);
    
    if (!await fs.pathExists(examplePath)) {
      console.log(`⚠️  Example ${exampleName} not found`);
      return false;
    }
    
    console.log(`🔧 Setting up ${exampleName}...`);
    
    try {
      const projectInfo = await this.detectProjectType(examplePath);
      console.log(`   Type: ${projectInfo.type}`);
      
      switch (projectInfo.type) {
        case 'react':
          await this.setupReactProject(examplePath, projectInfo.packageJson);
          break;
          
        case 'vite':
          await this.setupViteProject(examplePath, projectInfo.packageJson);
          break;
          
        case 'buildable':
          await this.setupBuildableProject(examplePath, projectInfo.packageJson);
          break;
          
        case 'static':
          console.log(`   ✅ Static project - no setup needed`);
          return true;
          
        default:
          console.log(`   ⚠️  Unknown project type`);
          return false;
      }
      
      this.builtExamples.push(exampleName);
      console.log(`   ✅ ${exampleName} setup complete`);
      return true;
      
    } catch (error) {
      console.error(`   ❌ Failed to setup ${exampleName}:`, error.message);
      this.failedExamples.push({ name: exampleName, error: error.message });
      return false;
    }
  }

  async setupReactProject(examplePath, packageJson) {
    // Install dependencies
    await this.runCommand('npm', ['install'], examplePath);
    
    // Build the project
    if (packageJson.scripts?.['build']) {
      await this.runCommand('npm', ['run', 'build'], examplePath);
      
      // Create a simple index.html that serves the built files
      await this.createReactIndexHtml(examplePath);
    }
  }

  async setupViteProject(examplePath, packageJson) {
    // Install dependencies
    await this.runCommand('npm', ['install'], examplePath);
    
    // Build the project
    if (packageJson.scripts?.['build']) {
      await this.runCommand('npm', ['run', 'build'], examplePath);
    }
  }

  async setupBuildableProject(examplePath, packageJson) {
    // Install dependencies
    await this.runCommand('npm', ['install'], examplePath);
    
    // Try to build
    if (packageJson.scripts?.['build']) {
      await this.runCommand('npm', ['run', 'build'], examplePath);
    }
  }

  async createReactIndexHtml(examplePath) {
    const buildPath = path.join(examplePath, 'build');
    const distPath = path.join(examplePath, 'dist');
    
    // Check which build directory exists
    let buildDir = null;
    if (await fs.pathExists(buildPath)) {
      buildDir = 'build';
    } else if (await fs.pathExists(distPath)) {
      buildDir = 'dist';
    }
    
    if (buildDir) {
      // Create a redirect index.html
      const indexHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
        // Redirect to build directory
        window.location.href = './${buildDir}/index.html';
    </script>
</head>
<body>
    <p>Redirecting to <a href="./${buildDir}/index.html">demo</a>...</p>
</body>
</html>`;
      
      await fs.writeFile(path.join(examplePath, 'index.html'), indexHtml);
    }
  }

  async run() {
    console.log('🛠️  Setting up examples that need building...\n');
    
    // List of examples that typically need setup
    const examplesNeedingSetup = [
      'space-travel-warp',
      'matrix-sentinels', 
      'morph-particles',
      'god-grass',
      'instanced-mesh'
    ];
    
    for (const exampleName of examplesNeedingSetup) {
      await this.setupExample(exampleName);
      console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log('📊 Setup Summary:');
    console.log(`✅ Successfully setup: ${this.builtExamples.length} examples`);
    if (this.builtExamples.length > 0) {
      this.builtExamples.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log(`❌ Failed setup: ${this.failedExamples.length} examples`);
    if (this.failedExamples.length > 0) {
      this.failedExamples.forEach(({ name, error }) => {
        console.log(`   - ${name}: ${error}`);
      });
    }
    
    console.log('\n💡 After setup, you can run "npm run build-gallery" to update the gallery');
  }
}

// Run if called directly
if (require.main === module) {
  const setup = new ExampleSetup();
  setup.run().catch(console.error);
}

module.exports = ExampleSetup; 