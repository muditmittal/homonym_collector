# 🔤 Homonym Collector

A beautiful, modern web application for collecting and managing homonyms - words that sound alike but have different meanings and spellings.

![Homonym Collector](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- **📚 Pre-loaded Collection**: Starts with 78 carefully curated homonym groups
- **🔍 Smart Search**: Real-time filtering of your homonym collection
- **➕ Easy Addition**: Find and add new homonyms with pronunciation matching
- **📖 Definitions**: Automatic definition lookup for each word using Free Dictionary API
- **🎨 Modern UI**: Clean, responsive design with smooth animations
- **💾 Local Storage**: Your collection persists between sessions
- **🏷️ Collection Management**: Create, rename, duplicate, and delete collections
- **🗑️ Quick Actions**: Instant tooltips and hover effects for better UX

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local development server) or any HTTP server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/homonym-collector.git
   cd homonym-collector
   ```

2. **Start a local server**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Or using Python 2
   python -m SimpleHTTPServer 8000
   
   # Or using Node.js
   npx http-server
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

## 🎯 How to Use

### Searching Your Collection
- Type in the search box to filter existing homonyms
- Results update in real-time as you type

### Adding New Homonyms
1. Click the **+** button next to the search box
2. Enter a word you want to find homonyms for
3. Select from the suggested pronunciation matches
4. The app automatically fetches definitions for each word
5. Click "Add Homonym" to save to your collection

### Managing Collections
- **New Collection**: Click the "New Collection" button in the header
- **Rename**: Use the overflow menu (⋮) next to the collection count
- **Duplicate**: Create a copy of your current collection
- **Delete**: Remove the entire collection (with confirmation)

### Deleting Individual Homonyms
- Hover over any homonym card to see the delete button
- Click the red trash icon to remove (with confirmation)
- Instant tooltip shows "Delete homonym" on hover

## 🏗️ Project Structure

```
homonym-collector/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # JavaScript logic and API calls
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🎨 Design Features

- **Gradient Background**: Beautiful purple gradient header
- **Card-based Layout**: Clean, modern homonym cards
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects and transitions
- **Custom Tooltips**: Instant, dark-themed tooltips
- **Typography**: Carefully chosen fonts and spacing

## 🔧 Technical Details

### APIs Used
- **Free Dictionary API**: For word definitions and pronunciations
- **Local Storage**: For persisting user data

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance Features
- Debounced search input
- Async API calls with timeout handling
- Efficient DOM manipulation
- Local storage caching

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Report Bugs**: Open an issue with bug details
2. **Suggest Features**: Share ideas for new functionality
3. **Improve Design**: Submit UI/UX improvements
4. **Add Homonyms**: Expand the default collection
5. **Documentation**: Help improve this README

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Free Dictionary API** for providing word definitions
- **Font Awesome** for beautiful icons
- **Oshi** for inspiring the default collection name
- The wonderful world of **homonyms** for making language interesting!

## 📊 Stats

- **78** pre-loaded homonym groups
- **3** core files (HTML, CSS, JS)
- **0** external dependencies
- **100%** vanilla JavaScript
- **∞** possibilities for learning!

---

**Made with ❤️ for word lovers everywhere**

*Start exploring the fascinating world of homonyms today!*
