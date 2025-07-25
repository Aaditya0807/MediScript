const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const router = express.Router();
const uploadRoutes = require('./routes/upload');

const upload = multer({ dest: 'uploads/' });
app.use('/api', uploadRoutes);

router.post('/upload-audio', upload.single('audio'), async (req, res) => {
  const filePath = req.file.path;

  try {
    const response = await axios.post('http://localhost:5000/transcribe', 
      {
        audio: fs.createReadStream(filePath)
      },
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    fs.unlinkSync(filePath); // remove after use

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
