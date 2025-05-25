const fs = require('fs-extra');
const path = require('path');
const simpleGit = require('simple-git');
const { marked } = require('marked');
const config = require('../config/gallery.config.js');

class ExamplesFetcher {
  constructor() {
    this.examplesDir = config.examples.baseDir;
    this.metadataFile = config.examples.metadataFile;
    this.examples = [];
  }

  async parseMarkdownFile() {
    console.log('📖 Parsing examples-list.md...');
    
    const content = await fs.readFile('examples-list.md', 'utf8');
    const tokens = marked.lexer(content);
    
    let currentExample = null;
    
    for (const token of tokens) {
      if (token.type === 'heading' && token.depth === 3) {
        if (currentExample) {
          this.examples.push(currentExample);
        }
        
        // Extract title and URL from markdown link
        const linkMatch = token.text.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          currentExample = {
            title: linkMatch[1],
            url: linkMatch[2],
            tags: [],
            description: '',
            author: '',
            license: '',
            folder: this.generateFolderName(linkMatch[1])
          };
        }
      } else if (token.type === 'list' && currentExample) {
        // Parse metadata from list items
        for (const item of token.items) {
          const text = item.text;
          if (text.includes('**Tags**:')) {
            currentExample.tags = text.split(':')[1].trim().split(',').map(t => t.trim());
          } else if (text.includes('**Description**:')) {
            currentExample.description = text.split(':')[1].trim();
          } else if (text.includes('**Author**:')) {
            currentExample.author = text.split(':')[1].trim();
          } else if (text.includes('**License**:')) {
            currentExample.license = text.split(':')[1].trim();
          } else if (text.includes('**Folder**:')) {
            currentExample.folder = text.split(':')[1].trim();
          }
        }
      }
    }
    
    // Add the last example
    if (currentExample) {
      this.examples.push(currentExample);
    }
    
    // Filter out the example template
    this.examples = this.examples.filter(ex => !ex.url.includes('github.com/example/repo'));
    
    console.log(`✅ Found ${this.examples.length} examples to fetch`);
    return this.examples;
  }

  generateFolderName(title) {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  async cloneRepository(example) {
    const targetPath = path.join(this.examplesDir, example.folder);
    
    // Check if already exists
    if (await fs.pathExists(targetPath)) {
      console.log(`⏭️  Skipping ${example.title} (already exists)`);
      return;
    }
    
    console.log(`📥 Cloning ${example.title}...`);
    
    try {
      const git = simpleGit();
      await git.clone(example.url, targetPath);
      
      // Add metadata file to the example
      const metadata = {
        ...example,
        clonedAt: new Date().toISOString(),
        originalRepo: example.url
      };
      
      await fs.writeJSON(path.join(targetPath, '.vibe-metadata.json'), metadata, { spaces: 2 });
      
      console.log(`✅ Successfully cloned ${example.title}`);
    } catch (error) {
      console.error(`❌ Failed to clone ${example.title}:`, error.message);
    }
  }

  async saveMetadata() {
    console.log('💾 Saving metadata...');
    
    const metadata = {
      generatedAt: new Date().toISOString(),
      totalExamples: this.examples.length,
      examples: this.examples,
      tags: this.collectAllTags()
    };
    
    await fs.ensureDir(path.dirname(this.metadataFile));
    await fs.writeJSON(this.metadataFile, metadata, { spaces: 2 });
    
    console.log(`✅ Metadata saved to ${this.metadataFile}`);
  }

  collectAllTags() {
    const allTags = new Set();
    this.examples.forEach(example => {
      example.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }

  async run() {
    console.log('🚀 Starting examples fetcher...\n');
    
    try {
      // Ensure examples directory exists
      await fs.ensureDir(this.examplesDir);
      
      // Parse the markdown file
      await this.parseMarkdownFile();
      
      if (this.examples.length === 0) {
        console.log('⚠️  No examples found. Add some to examples-list.md');
        return;
      }
      
      // Clone each repository
      for (const example of this.examples) {
        await this.cloneRepository(example);
      }
      
      // Save metadata
      await this.saveMetadata();
      
      console.log('\n🎉 Fetch complete!');
      console.log(`📁 Examples saved to: ${this.examplesDir}`);
      console.log(`🗃️  Metadata saved to: ${this.metadataFile}`);
      
    } catch (error) {
      console.error('💥 Error:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const fetcher = new ExamplesFetcher();
  fetcher.run();
}

module.exports = ExamplesFetcher; 