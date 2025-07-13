// Create better food-themed placeholder images
// This script creates colored placeholder images with food icons

const fs = require('fs');
const path = require('path');

// SVG placeholder templates with food-themed colors and text
const createFoodPlaceholder = (width, height, backgroundColor, textColor, foodName, emoji) => {
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${backgroundColor}"/>
    <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${foodName}</text>
  </svg>`;
};

const foodPlaceholders = [
  {
    name: 'bruschetta.svg',
    path: 'antipasti',
    backgroundColor: '#8B4513', // Saddle brown for bread
    textColor: '#FFFFFF',
    foodName: 'Bruschetta',
    emoji: '🍞'
  },
  {
    name: 'prosciutto-melon.svg',
    path: 'antipasti',
    backgroundColor: '#FF6B6B', // Salmon pink for prosciutto
    textColor: '#FFFFFF', 
    foodName: 'Prosciutto & Melon',
    emoji: '🍈'
  },
  {
    name: 'carbonara.svg',
    path: 'pasta',
    backgroundColor: '#FFD93D', // Golden yellow for carbonara
    textColor: '#333333',
    foodName: 'Carbonara',
    emoji: '🍝'
  },
  {
    name: 'amatriciana.svg',
    path: 'pasta',
    backgroundColor: '#FF4757', // Tomato red for amatriciana
    textColor: '#FFFFFF',
    foodName: 'Amatriciana', 
    emoji: '🍝'
  },
  {
    name: 'margherita.svg',
    path: 'pizza',
    backgroundColor: '#2ED573', // Basil green for margherita
    textColor: '#FFFFFF',
    foodName: 'Margherita',
    emoji: '🍕'
  },
  {
    name: 'quattro-formaggi.svg',
    path: 'pizza',
    backgroundColor: '#FFA502', // Cheese orange for quattro formaggi
    textColor: '#FFFFFF',
    foodName: 'Quattro Formaggi',
    emoji: '🍕'
  },
  {
    name: 'ossobuco.svg',
    path: 'main',
    backgroundColor: '#8B4513', // Brown for meat dish
    textColor: '#FFFFFF',
    foodName: 'Ossobuco',
    emoji: '🥩'
  },
  {
    name: 'tiramisu.svg',
    path: 'dessert',
    backgroundColor: '#D2B48C', // Tan for tiramisu
    textColor: '#333333',
    foodName: 'Tiramisu',
    emoji: '🍰'
  },
  {
    name: 'espresso.svg',
    path: 'beverages',
    backgroundColor: '#3C2414', // Dark brown for espresso
    textColor: '#FFFFFF',
    foodName: 'Espresso',
    emoji: '☕'
  },
  {
    name: 'chianti.svg',
    path: 'beverages',
    backgroundColor: '#722F37', // Dark red for wine
    textColor: '#FFFFFF',
    foodName: 'Chianti',
    emoji: '🍷'
  }
];

function createPlaceholderImage(imageInfo) {
  const dirPath = path.join(__dirname, '..', 'public', 'images', 'menu', imageInfo.path);
  const filePath = path.join(dirPath, imageInfo.name);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const svg = createFoodPlaceholder(
    400, 
    300, 
    imageInfo.backgroundColor, 
    imageInfo.textColor, 
    imageInfo.foodName, 
    imageInfo.emoji
  );
  
  fs.writeFileSync(filePath, svg);
  console.log(`✓ Created: ${imageInfo.path}/${imageInfo.name}`);
}

function createAllPlaceholders() {
  console.log('🎨 Creating food-themed placeholder images...\n');
  
  try {
    foodPlaceholders.forEach(createPlaceholderImage);
    
    console.log('\n✅ All placeholder images created successfully!');
    console.log('\nThese are temporary placeholders. For production, replace with:');
    console.log('• High-quality food photography');
    console.log('• Professional restaurant images');
    console.log('• Images from Unsplash, Pexels, or your own photos');
    
  } catch (error) {
    console.error('\n❌ Error creating placeholders:', error);
  }
}

createAllPlaceholders();