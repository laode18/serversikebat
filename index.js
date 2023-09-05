const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
// Serve files from the 'uploads' directory
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));


// Set storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination directory where the files will be saved
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Set the filename as a unique name
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// Initialize multer with the storage options
const upload = multer({ storage });

// ... (existing code)

// Route for handling file uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }
  const filename = req.file.filename;
  return res.status(201).json({ filename });
});

// In-memory data store for surat keterangan RT
let data = [
  { id: 1, name: "John Doe", letterNumber: "file1.pdf" },
  { id: 2, name: "Jane Smith", letterNumber: "file2.pdf" },
  // Add more data here
];

// Endpoint to get all surat keterangan RT data
app.get('/api/surat', (req, res) => {
  return res.status(200).json(data);
});

app.post('/api/surat', (req, res) => {
  const id = uuidv4();
  const { name, letterNumber, aktaNotaris, gambar } = req.body;

  // Check if either letterNumber or aktaNotaris is provided
  if (!letterNumber && !aktaNotaris && !gambar) {
    return res.status(400).json({ error: 'Either letterNumber or aktaNotaris must be provided' });
  }

  // Assuming that the file names are sent in the request body
  const newSurat = { id, name, letterNumber: letterNumber || '', aktaNotaris: aktaNotaris || '', gambar: gambar || '' };
  data.push(newSurat);
  return res.status(201).json(newSurat);
});

app.put('/api/surat/:id', (req, res) => {
  const { id } = req.params;
  const { name, letterNumber, aktaNotaris, gambar } = req.body;
  const index = data.findIndex(surat => surat.id === parseInt(id));
  if (index === -1) {
    return res.status(404).json({ error: 'Surat not found' });
  }

  // Assuming that the file names are sent in the request body
  const updatedSurat = {
    ...data[index],
    name,
    letterNumber: letterNumber || data[index].letterNumber,
    aktaNotaris: aktaNotaris || data[index].aktaNotaris,
    gambar: gambar || data[index].gambar,
  };
  data[index] = updatedSurat;
  return res.status(200).json(updatedSurat);
});

// Endpoint to delete surat keterangan RT data
app.delete('/api/surat/:id', (req, res) => {
  const { id } = req.params;
  data = data.filter(surat => surat.id !== parseInt(id));
  return res.status(200).json({ message: 'Surat deleted successfully' });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
