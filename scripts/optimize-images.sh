#!/bin/bash

# Image optimization script for Bella Vista menu images
# Requires ImageMagick (install with: brew install imagemagick)

echo "🖼️  Optimizing menu images for web..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Install with:"
    echo "   brew install imagemagick"
    exit 1
fi

# Create optimized directory
mkdir -p public/images/menu-optimized

# Function to optimize image
optimize_image() {
    local input_file="$1"
    local output_file="$2"
    local quality=85
    local max_width=800
    
    echo "   Optimizing: $(basename "$input_file")"
    
    # Resize and compress
    convert "$input_file" \
        -resize "${max_width}x>" \
        -quality $quality \
        -strip \
        "$output_file"
    
    # Check file sizes
    local original_size=$(du -h "$input_file" | cut -f1)
    local optimized_size=$(du -h "$output_file" | cut -f1)
    
    echo "     Original: $original_size → Optimized: $optimized_size"
}

# Optimize all categories
for category in antipasti pasta pizza main dessert beverages; do
    echo "📁 Processing $category..."
    mkdir -p "public/images/menu-optimized/$category"
    
    # Find all PNG files in category
    find "public/images/menu/$category" -name "*.png" | while read -r file; do
        filename=$(basename "$file")
        output_file="public/images/menu-optimized/$category/$filename"
        optimize_image "$file" "$output_file"
    done
done

echo ""
echo "✅ Image optimization complete!"
echo ""
echo "📊 Size comparison:"
echo "Original images:"
du -sh public/images/menu/*/
echo ""
echo "Optimized images:"
du -sh public/images/menu-optimized/*/
echo ""
echo "💡 To use optimized images:"
echo "1. Backup original: mv public/images/menu public/images/menu-original"
echo "2. Use optimized: mv public/images/menu-optimized public/images/menu"
echo "3. Run SQL update again if needed"