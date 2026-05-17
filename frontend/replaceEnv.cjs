const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace 'http://localhost:5000/api...' with import.meta.env.VITE_API_URL + '/api...'
  // Note: we might have just 'http://localhost:5000' for socket.io
  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "import.meta.env.VITE_API_URL + '$1'");
  
  // Replace `http://localhost:5000/api...` with `${import.meta.env.VITE_API_URL}/api...`
  content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, "`\\${import.meta.env.VITE_API_URL}$1`");

  // Fix socket.io where it might end up as import.meta.env.VITE_API_URL + ''
  content = content.replace(/ \+ ''/g, "");

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
