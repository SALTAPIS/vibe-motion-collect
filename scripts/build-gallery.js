const fs = require('fs-extra');
const path = require('path');
const config = require('../config/gallery.config.js');

class GalleryBuilder {
  constructor() {
    this.metadataFile = config.examples.metadataFile;
    this.galleryDir = './gallery';
  }

  async loadMetadata() {
    if (!await fs.pathExists(this.metadataFile)) {
      console.log('⚠️  No metadata found. Run `npm run fetch` first.');
      return null;
    }
    
    return await fs.readJSON(this.metadataFile);
  }

  generateHTML(metadata) {
    const { examples, tags } = metadata;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.gallery.title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        header {
            text-align: center;
            margin-bottom: 3rem;
            color: white;
        }
        
        h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .stat {
            background: rgba(255,255,255,0.2);
            padding: 1rem 2rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
        }
        
        .filters {
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 3rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .filter-group {
            margin-bottom: 1.5rem;
        }
        
        .filter-label {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #555;
        }
        
        .filter-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .tag {
            padding: 0.5rem 1rem;
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
        }
        
        .tag:hover, .tag.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
        }
        
        .search-box {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            font-size: 1rem;
            margin-bottom: 1rem;
        }
        
        .search-box:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }
        
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
        }
        
        .example-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border: 1px solid #f0f0f0;
        }
        
        .example-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .card-preview {
            height: 200px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: #6c757d;
        }
        
        .card-content {
            padding: 1.5rem;
        }
        
        .card-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #333;
        }
        
        .card-author {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        .card-description {
            color: #555;
            line-height: 1.5;
            margin-bottom: 1rem;
        }
        
        .card-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .card-tag {
            padding: 0.25rem 0.75rem;
            background: #f8f9fa;
            border-radius: 12px;
            font-size: 0.8rem;
            color: #666;
            border: 1px solid #e9ecef;
        }
        
        .card-actions {
            display: flex;
            gap: 1rem;
        }
        
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            flex: 1;
        }
        
        .btn-primary {
            background: #007bff;
            color: white;
        }
        
        .btn-primary:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #545b62;
            transform: translateY(-2px);
        }
        
        .no-results {
            text-align: center;
            padding: 4rem 2rem;
            color: white;
        }
        
        .no-results h3 {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .stats {
                flex-direction: column;
                gap: 1rem;
            }
            
            .gallery {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${config.gallery.title}</h1>
            <p class="subtitle">${config.gallery.description}</p>
            <div class="stats">
                <div class="stat">
                    <strong>${examples.length}</strong><br>
                    Examples
                </div>
                <div class="stat">
                    <strong>${tags.length}</strong><br>
                    Tags
                </div>
                <div class="stat">
                    <strong>${new Date(metadata.generatedAt).toLocaleDateString()}</strong><br>
                    Last Updated
                </div>
            </div>
        </header>
        
        <div class="filters">
            <input type="text" class="search-box" placeholder="Search examples..." id="searchBox">
            
            <div class="filter-group">
                <div class="filter-label">All Tags</div>
                <div class="filter-tags" id="tagFilters">
                    ${tags.map(tag => `<div class="tag" data-tag="${tag}">${tag}</div>`).join('')}
                </div>
            </div>
        </div>
        
        <div class="gallery" id="gallery">
            ${examples.map(example => this.generateExampleCard(example)).join('')}
        </div>
        
        <div class="no-results" id="noResults" style="display: none;">
            <h3>No examples found</h3>
            <p>Try adjusting your search or filters</p>
        </div>
    </div>
    
    <script>
        // Gallery functionality
        const examples = ${JSON.stringify(examples)};
        const searchBox = document.getElementById('searchBox');
        const tagFilters = document.getElementById('tagFilters');
        const gallery = document.getElementById('gallery');
        const noResults = document.getElementById('noResults');
        
        let activeFilters = new Set();
        let searchTerm = '';
        
        function filterExamples() {
            const filtered = examples.filter(example => {
                // Search term filter
                const matchesSearch = !searchTerm || 
                    example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    example.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    example.author.toLowerCase().includes(searchTerm.toLowerCase());
                
                // Tag filter
                const matchesTags = activeFilters.size === 0 || 
                    example.tags.some(tag => activeFilters.has(tag));
                
                return matchesSearch && matchesTags;
            });
            
            renderGallery(filtered);
        }
        
        function renderGallery(examplesList) {
            if (examplesList.length === 0) {
                gallery.style.display = 'none';
                noResults.style.display = 'block';
            } else {
                gallery.style.display = 'grid';
                noResults.style.display = 'none';
                gallery.innerHTML = examplesList.map(example => \`${this.generateExampleCardJS()}\`).join('');
            }
        }
        
        // Event listeners
        searchBox.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            filterExamples();
        });
        
        tagFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag')) {
                const tag = e.target.dataset.tag;
                
                if (activeFilters.has(tag)) {
                    activeFilters.delete(tag);
                    e.target.classList.remove('active');
                } else {
                    activeFilters.add(tag);
                    e.target.classList.add('active');
                }
                
                filterExamples();
            }
        });
        
        // Open example
        function openExample(folder) {
            window.open(\`/examples/\${folder}\`, '_blank');
        }
        
        function viewSource(url) {
            window.open(url, '_blank');
        }
    </script>
</body>
</html>`;
  }

  generateExampleCard(example) {
    return `
      <div class="example-card" data-tags='${JSON.stringify(example.tags)}'>
          <div class="card-preview">
              🎨
          </div>
          <div class="card-content">
              <h3 class="card-title">${example.title}</h3>
              <p class="card-author">by ${example.author}</p>
              <p class="card-description">${example.description}</p>
              <div class="card-tags">
                  ${example.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
              </div>
              <div class="card-actions">
                  <button class="btn btn-primary" onclick="openExample('${example.folder}')">
                      View Demo
                  </button>
                  <button class="btn btn-secondary" onclick="viewSource('${example.url}')">
                      Source Code
                  </button>
              </div>
          </div>
      </div>`;
  }

  generateExampleCardJS() {
    return `
      <div class="example-card" data-tags='\${JSON.stringify(example.tags)}'>
          <div class="card-preview">
              🎨
          </div>
          <div class="card-content">
              <h3 class="card-title">\${example.title}</h3>
              <p class="card-author">by \${example.author}</p>
              <p class="card-description">\${example.description}</p>
              <div class="card-tags">
                  \${example.tags.map(tag => \`<span class="card-tag">\${tag}</span>\`).join('')}
              </div>
              <div class="card-actions">
                  <button class="btn btn-primary" onclick="openExample('\${example.folder}')">
                      View Demo
                  </button>
                  <button class="btn btn-secondary" onclick="viewSource('\${example.url}')">
                      Source Code
                  </button>
              </div>
          </div>
      </div>`;
  }

  async run() {
    console.log('🎨 Building gallery...');
    
    const metadata = await this.loadMetadata();
    if (!metadata) return;
    
    const html = this.generateHTML(metadata);
    
    await fs.ensureDir(this.galleryDir);
    await fs.writeFile(path.join(this.galleryDir, 'index.html'), html);
    
    console.log('✅ Gallery built successfully!');
    console.log(`📁 Gallery saved to: ${this.galleryDir}/index.html`);
  }
}

// Run if called directly
if (require.main === module) {
  const builder = new GalleryBuilder();
  builder.run();
}

module.exports = GalleryBuilder; 