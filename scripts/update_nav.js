const fs = require('fs');

const files = ['index.html', 'membership.html', 'boutiques.html', 'admin.html', 'about.html'];

files.forEach(file => {
  const fullPath = 'c:/tmp/Chempaka/' + file;
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Desktop nav
    content = content.replace(
      /href="index\.html#about">About<\/a>/g,
      'href="about.html">Journal</a>'
    );
    
    // Mobile nav
    content = content.replace(
      /href="index\.html#about" onclick="toggleMobileDrawer\(false\)">About<\/a>/g,
      'href="about.html" onclick="toggleMobileDrawer(false)">Journal</a>'
    );

    // Footer links
    content = content.replace(
      /href="index\.html#about"(.*?)>Masters of Gold<\/a>/g,
      'href="about.html#heritage"$1>Masters of Gold</a>'
    );
    content = content.replace(
      /href="index\.html#about"(.*?)>Heritage Story<\/a>/g,
      'href="about.html#heritage"$1>Heritage Story</a>'
    );
    content = content.replace(
      /href="index\.html#about"(.*?)>Sustainability<\/a>/g,
      'href="about.html#heritage"$1>Sustainability</a>'
    );

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated nav in ' + file);
  }
});
