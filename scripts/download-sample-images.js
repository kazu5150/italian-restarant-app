// Sample image download script
// Run this with: node scripts/download-sample-images.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Placeholder image service URLs (using Lorem Picsum with food-related seeds)
const sampleImages = [
  {
    name: 'bruschetta.jpg',
    path: 'antipasti',
    url: 'https://picsum.photos/seed/bruschetta/400/300',
    description: 'Bruschetta placeholder'
  },
  {
    name: 'prosciutto-melon.jpg',
    path: 'antipasti', 
    url: 'https://picsum.photos/seed/prosciutto/400/300',
    description: 'Prosciutto with melon placeholder'
  },
  {
    name: 'carbonara.jpg',
    path: 'pasta',
    url: 'https://picsum.photos/seed/carbonara/400/300',
    description: 'Carbonara pasta placeholder'
  },
  {
    name: 'amatriciana.jpg',
    path: 'pasta',
    url: 'https://picsum.photos/seed/amatriciana/400/300',
    description: 'Amatriciana pasta placeholder'
  },
  {
    name: 'margherita.jpg',
    path: 'pizza',
    url: 'https://picsum.photos/seed/margherita/400/300',
    description: 'Margherita pizza placeholder'
  },
  {
    name: 'quattro-formaggi.jpg',
    path: 'pizza',
    url: 'https://picsum.photos/seed/quattroformaggi/400/300',
    description: 'Quattro Formaggi pizza placeholder'
  },
  {
    name: 'ossobuco.jpg',
    path: 'main',
    url: 'https://picsum.photos/seed/ossobuco/400/300',
    description: 'Ossobuco main course placeholder'
  },
  {
    name: 'tiramisu.jpg',
    path: 'dessert',
    url: 'https://picsum.photos/seed/tiramisu/400/300',
    description: 'Tiramisu dessert placeholder'
  },
  {
    name: 'espresso.jpg',
    path: 'beverages',
    url: 'https://picsum.photos/seed/espresso/400/300',
    description: 'Espresso coffee placeholder'
  },
  {
    name: 'chianti.jpg',
    path: 'beverages',
    url: 'https://picsum.photos/seed/chianti/400/300',
    description: 'Chianti wine placeholder'
  }
];

function downloadImage(imageInfo) {
  return new Promise((resolve, reject) => {
    const dirPath = path.join(__dirname, '..', 'public', 'images', 'menu', imageInfo.path);
    const filePath = path.join(dirPath, imageInfo.name);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const file = fs.createWriteStream(filePath);
    
    https.get(imageInfo.url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${imageInfo.path}/${imageInfo.name}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file on error
      console.error(`✗ Failed to download ${imageInfo.name}:`, err.message);
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('🍝 Downloading sample images for Bella Vista menu...\n');
  
  try {
    for (const imageInfo of sampleImages) {
      await downloadImage(imageInfo);
      // Small delay to be respectful to the service
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n✅ All sample images downloaded successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the SQL commands in add-menu-images.sql in Supabase');
    console.log('2. Start your development server: npm run dev');
    console.log('3. Visit the menu page to see images in action!');
    
  } catch (error) {
    console.error('\n❌ Error downloading images:', error);
  }
}

downloadAllImages();