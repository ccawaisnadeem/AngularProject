// vercel.js - Helper for Angular routing on Vercel
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Redirect all requests to index.html for Angular SPA
  res.writeHead(200, { 'Content-Type': 'text/html' });
  require('fs').createReadStream('./dist/app/index.html').pipe(res);
};
