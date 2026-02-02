# 🎮 Gaming PC Cases Catalog

Professional MSI-style catalog showcasing gaming PC cases with specifications extracted from Excel files.

![MSI Style](https://img.shields.io/badge/Style-MSI_Gaming-red?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)

## 🌟 Live Demo

**[View Catalog →](https://YOUR_USERNAME.github.io/YOUR_REPO/)**

## 📸 Preview

- **13 Pages** - One page per product line
- **72 Product Images** - All embedded (no external dependencies)
- **Complete Specifications** - Every detail from source Excel files
- **MSI Gaming Aesthetic** - Red/black color scheme, angular design
- **Print Ready** - Export to PDF directly from browser

## ✨ Features

### Design
- 🎨 **MSI Gaming Brand Colors** - Red (#FF0000) and black theme
- 🔤 **Custom Typography** - Orbitron + Rajdhani fonts
- ✨ **Hover Effects** - Interactive image scaling and glow
- 📱 **Responsive Grid** - Adapts to different screen sizes
- 🖨️ **Print Optimized** - Clean PDF export via browser print

### Technical
- ⚡ **Single HTML File** - No external dependencies (except fonts)
- 🖼️ **Base64 Images** - All 72 images embedded inline
- 🌐 **Works Offline** - No internet needed after initial load
- 📦 **Zero Build Process** - Just open in browser
- ♿ **Semantic HTML** - Clean, accessible markup

## 🚀 Quick Start

### View Locally
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Open the file
cd YOUR_REPO
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

### Export as PDF
1. Open `index.html` in Chrome/Edge/Firefox
2. Press `Ctrl+P` (Windows) or `Cmd+P` (Mac)
3. Select "Save as PDF"
4. Click "Save"

## 🎨 Customization Guide

All customization options are clearly marked with comments in `index.html`.

### Quick Color Change

Find this section at the top of the file (around line 15):

```css
:root {
    --primary-color: #ff0000;      /* 👈 Change this for different brand color */
    --primary-dark: #cc0000;       
    --background: #000000;         
    --text-white: #ffffff;         
}
```

### Font Customization

Line 32:
```css
@import url('https://fonts.googleapis.com/css2?family=YOUR_FONT');
```

Then update (line 23-24):
```css
--font-display: 'YOUR_FONT', sans-serif;
--font-body: 'YOUR_FONT', sans-serif;
```

### Size Adjustments

```css
--title-size: 32px;      /* Page titles */
--price-size: 48px;      /* Price display */
--page-padding: 40px;    /* Space around pages */
```

### Image Grid Size

Line 96:
```css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
/*                                              👆 Change this */
```

### Specification Table Width

Line 149:
```css
grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
/*                                              👆 Change this */
```

## 📊 Data Structure

The catalog extracts data from Excel files with the following structure:

```
Page 1: BP Series (7 models)
Page 2: Serie 500 (3 models)  
Page 3: 1001 M-ATX
Page 4: 1101 ATX
Page 5: 9001 Pescera
Page 6: N7 Glass
Page 7: Serie 240/360
Page 8: U100
Page 9: J02 Slim
Page 10: J01 Slim
Page 11: 270-D1
Page 12: NB Office Series
Page 13: XPH with Display
```

## 🛠️ Advanced Editing

### Add More Price Detection Keywords

Line 216:
```javascript
const priceKeywords = ['PRECIO', 'FOB', 'Precio', 'PRICE', 'foc'];
// Add more keywords here 👆
```

### Skip Certain Specifications

Line 239:
```javascript
const skipWords = ['PRECIO', 'PRICE', 'FOB', 'Image', 'imagen', 'Photo'];
// Add words to exclude 👆
```

### Modify Spec Extraction Logic

See `parseSpecs()` function starting at line 233. This controls how specifications are extracted from the Excel data.

## 📤 Deploy to GitHub Pages

### Option 1: Using GitHub Web Interface
1. Create new repository on GitHub
2. Upload `index.html`, `README.md`, and `.gitignore`
3. Go to Settings → Pages
4. Source: "main" branch, root folder
5. Save

Your catalog will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

### Option 2: Using Git Command Line
```bash
# Initialize repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Gaming PC Cases Catalog"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main

# Enable GitHub Pages (do this in GitHub Settings → Pages)
```

## 🌐 Access Your Live Catalog

After enabling GitHub Pages, your catalog will be available at:

```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

Example:
```
https://johndoe.github.io/gaming-cases-catalog/
```

## 📱 Share the Catalog

Once deployed, you can share:
- **Direct Link**: Send the GitHub Pages URL
- **QR Code**: Generate QR code pointing to your URL
- **Embed**: Use `<iframe>` to embed in other websites
- **PDF**: Print to PDF and email/share as document

## 🔧 Technical Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript** - No frameworks or libraries
- **Google Fonts** - Orbitron (display) + Rajdhani (body)
- **Base64** - Inline image embedding

## 📁 File Structure

```
.
├── index.html          # Main catalog file (everything in one file!)
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## 🎯 Use Cases

- **Sales Presentations** - Show to clients/distributors
- **E-commerce** - Product catalog for online store
- **Print Materials** - Export to PDF for brochures
- **Internal Documentation** - Product specifications reference
- **Trade Shows** - Display on tablets/screens

## 💡 Tips

1. **For Best PDF Quality**: Use Chrome/Edge at 100% zoom before printing
2. **Mobile Viewing**: Works great on tablets and phones
3. **Offline Use**: After first load, save webpage for offline access
4. **Update Data**: Edit the JavaScript object at the bottom of index.html
5. **Multiple Versions**: Duplicate index.html and customize for different brands

## 📄 License

This catalog template is free to use and modify for your business needs.

## 🤝 Contributing

Feel free to fork and customize for your own product catalogs!

## 📧 Support

For issues or questions about customization, create an issue in this repository.

---

**Built with** ❤️ **for gaming PC enthusiasts**
