const fs = require('fs');
const files = ['index.html', 'membership.html', 'boutiques.html', 'admin.html'];
const images = [
  'bracelet_category.jpg', 'custom_category.jpg', 'diamond_necklaces.png',
  'hero_background.jpg', 'hero_background_blue.jpg', 'hero_background_blue_8k.jpg',
  'hero_heart_ring.jpg', 'hero_model_hijab.jpg', 'hero_model_jewelry.jpg',
  'hero_necklace.jpg', 'hero_ring.jpg', 'necklace_category.jpg',
  'new_in_category.jpg', 'ring_category.jpg', 'ruby_necklace.jpg',
  'ruby_necklace.png', 'screen.png', 'winnie_the_pooh_crystal.jpg',
  'winnie_the_pooh_crystal.png'
];

files.forEach(file => {
  const fullPath = 'c:/tmp/Chempaka/' + file;
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    images.forEach(img => {
      // Replace src
      const srcRegex = new RegExp('src="' + img + '"', 'g');
      content = content.replace(srcRegex, 'src="assets/images/' + img + '"');
      // Replace url()
      const bgRegex = new RegExp('url\\\\(' + img + '\\\\)', 'g');
      content = content.replace(bgRegex, 'url(assets/images/' + img + ')');
    });
    
    // Replace product_images
    content = content.replace(/src="product_images\//g, 'src="assets/images/product_images/');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated ' + file);
  } else {
    console.log('File not found: ' + file);
  }
});
