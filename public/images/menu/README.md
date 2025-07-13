# Menu Images Directory

This directory contains images for menu items organized by category.

## Directory Structure

```
menu/
├── antipasti/          # Appetizer images
├── pasta/              # Pasta dish images
├── pizza/              # Pizza images
├── main/               # Main course images
├── dessert/            # Dessert images
└── beverages/          # Beverage images
```

## Image Requirements

- **Format**: JPG, PNG, WebP
- **Size**: 400x300px (4:3 aspect ratio) recommended
- **File size**: Under 500KB per image
- **Naming**: Use kebab-case (e.g., `margherita-pizza.jpg`)

## Sample Images Needed

### Antipasti
- `bruschetta.jpg` - Bruschetta with tomato and basil
- `prosciutto-melon.jpg` - Prosciutto with melon

### Pasta
- `carbonara.jpg` - Spaghetti Carbonara
- `amatriciana.jpg` - Pasta Amatriciana

### Pizza
- `margherita.jpg` - Margherita Pizza
- `quattro-formaggi.jpg` - Four Cheese Pizza

### Main Courses
- `ossobuco.jpg` - Ossobuco Milanese

### Dessert
- `tiramisu.jpg` - Classic Tiramisu

### Beverages
- `espresso.jpg` - Italian Espresso
- `chianti.jpg` - Chianti Wine

## Adding Images

1. Place image files in the appropriate category folder
2. Update the database `menu_items` table with the image URL:
   ```sql
   UPDATE menu_items 
   SET image_url = '/images/menu/category/filename.jpg' 
   WHERE name = 'Item Name';
   ```

## Image Sources

For development, you can use:
- **Unsplash**: Free high-quality food photos
- **Pexels**: Free stock photos
- **Your own photos**: Professional food photography

## Performance Notes

- Images are automatically optimized by Next.js Image component
- Consider using WebP format for better compression
- Images should be properly sized before upload