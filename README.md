# Vibe Motion Collect

A curated collection of animation examples using Three.js, GSAP, WebGL, and other web animation libraries. This project automatically fetches, organizes, and showcases animation examples in a beautiful gallery interface.

## ✨ Features

- **🎨 Beautiful Gallery**: Modern, responsive web interface to browse animations
- **🏷️ Smart Tagging**: Filter by library, animation type, complexity, and features  
- **🔍 Search**: Find examples by title, author, or description
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile
- **🚀 Auto-Fetch**: Automatically clone and organize GitHub repositories
- **⚡ Dev Server**: Single development server for all examples
- **📊 Metadata**: Detailed attribution and licensing information

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Animation Examples
Edit `examples-list.md` and add GitHub repository links:

```markdown
### [Particle System Demo](https://github.com/username/particle-demo)
- **Tags**: threejs, particles, shader
- **Description**: Beautiful particle system with custom shaders
- **Author**: John Doe
- **License**: MIT
```

### 3. Fetch & Build
```bash
npm run setup
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your animation gallery! 🎉

## 📖 Available Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Install dependencies, fetch examples, and build gallery |
| `npm run dev` | Start the development server |
| `npm run fetch` | Download new examples from GitHub |
| `npm run build-gallery` | Regenerate the gallery HTML |

## 📁 Project Structure

```
vibe-motion-collect/
├── examples/                 # Downloaded animation examples
│   ├── example-1/
│   ├── example-2/
│   └── .../
├── gallery/                  # Generated gallery files
│   └── index.html
├── scripts/                  # Automation scripts
│   ├── fetch-examples.js     # GitHub repository fetcher
│   ├── build-gallery.js     # Gallery generator
│   └── dev-server.js         # Development server
├── config/                   # Configuration files
│   ├── gallery.config.js     # Gallery settings
│   └── examples-metadata.json # Generated metadata
├── examples-list.md          # List of repositories to fetch
└── package.json              # Dependencies and scripts
```

## 🏷️ Supported Tags

### Libraries
`threejs`, `gsap`, `webgl`, `css`, `canvas`, `svg`

### Animation Types  
`particles`, `morphing`, `scroll`, `interactive`, `shader`, `geometry`, `lighting`

### Complexity
`beginner`, `intermediate`, `advanced`

### Features
`audio`, `physics`, `ai`, `procedural`, `responsive`

## 📝 Adding Examples

1. **Find a Repository**: Browse GitHub for animation examples
2. **Edit examples-list.md**: Add the repository with metadata
3. **Fetch**: Run `npm run fetch` to download
4. **Update Gallery**: Run `npm run build-gallery` to regenerate
5. **View**: The example will appear in your gallery

### Example Entry Format:
```markdown
### [Animation Title](https://github.com/username/repo-name)
- **Tags**: threejs, particles, beginner
- **Description**: What this animation demonstrates
- **Author**: Original creator's name
- **License**: MIT
- **Folder**: custom-folder-name (optional)
```

## 🛠️ Development

### Local Development
The development server serves:
- **Gallery**: `http://localhost:3000/` 
- **Examples**: `http://localhost:3000/examples/folder-name/`
- **API**: `http://localhost:3000/api/metadata`

### File Watching
The server automatically watches for changes and provides helpful logs.

### Custom Configuration
Edit `config/gallery.config.js` to customize:
- Gallery title and description
- Supported tags and categories  
- Server settings
- Development options

## 🤝 Contributing

1. Fork the repository
2. Add your animation examples to `examples-list.md`
3. Test locally with `npm run setup && npm run dev`
4. Submit a pull request

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Individual animation examples retain their original licenses as specified in their repositories.

## 🎯 Goals

This project aims to:
- **Preserve** amazing web animation examples
- **Organize** them in a searchable, browsable format
- **Inspire** developers with diverse animation techniques
- **Learn** from the community's creativity

## 🔗 Links

- **Repository**: https://github.com/SALTAPIS/vibe-motion-collect
- **Issues**: Report bugs or request features
- **Discussions**: Share your favorite animation examples

---

Made with ❤️ for the web animation community 