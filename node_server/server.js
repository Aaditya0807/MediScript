const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data'); // ⛳ You need this to build multipart/form-data

const app = express();
const upload = multer({ dest: 'uploads/' }); // ✅ Use local uploads folder

app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/public'))); // ✅ Serve CSS/JS from /public
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("audio"), async (req, res) => {
  const filePath = req.file.path;

  try {
    // 🛠 Construct proper FormData to send to Flask
    const form = new FormData();
    form.append('audio', fs.createReadStream(filePath));

    const pythonRes = await axios.post("http://localhost:5000/transcribe", form, {
      headers: form.getHeaders()
    });

    fs.unlinkSync(filePath); // ✅ Cleanup
    res.json(pythonRes.data);
  } catch (err) {
    console.error(err);
    res.json({ error: "Error connecting to Python service." });
  }
});

app.listen(3000, () => {
  console.log("Node.js server running on http://localhost:3000");
});
