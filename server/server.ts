import express from "express";
import multer from "multer";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".mp3", ".wav", ".flac", ".m4a", ".aiff"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio-files allowed!"));
    }
  },
});

app.get("/", (req, res) => {
  res.json({ message: "SoundScop API WORKS!" });
});

app.post("/api/upload", upload.single("audioFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("📁 Fil mottagen:", req.file.originalname);
  console.log("💾 Sparad som:", req.file.filename);

  res.json({
    message: "File uploaded!",
    file: {
      originalName: req.file.originalname,
      savedAs: req.file.filename,
      size: req.file.size,
      path: req.file.path,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server runs on http://localhost:${PORT}`);
});
