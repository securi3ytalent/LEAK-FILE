const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = 5000;
const UPLOAD_FOLDER = 'uploads';
const LOG_FILE = 'access_log.txt';

app.set('view engine', 'ejs');
app.set('templates', path.join(__dirname, 'templates'));
app.use(express.static('public'));

// Configure Multer for file storage with timestamped folders
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
    const sessionFolder = path.join(__dirname, UPLOAD_FOLDER, timestamp);
    fs.mkdirSync(sessionFolder, { recursive: true });
    req.uploadPath = sessionFolder; // Save for later use
    cb(null, sessionFolder);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload-files', upload.array('docs'), (req, res) => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15);
  const userIp = req.ip;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  const logEntry = `[${timestamp}] IP: ${userIp}, Agent: ${userAgent}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);

  res.send('✅ File Download successfully!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
