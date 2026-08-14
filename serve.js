const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve the frontend folder as static root
app.use(express.static(path.join(__dirname, 'frontend')));

// Redirect root to login page
app.get('/', (req, res) => {
  res.redirect('/public/login.html');
});

app.listen(port, () => {
  console.log(`Frontend server running at http://localhost:${port}`);
});
