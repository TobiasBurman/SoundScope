import express from "express";
import multer from "multer";
import path from "path";
import { analyzeAudioFile } from './services/audioAnalysis';

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

app.post("/api/upload", upload.single("audioFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    console.log("📁 Fil mottagen:", req.file.originalname);
    console.log("💾 Sparad som:", req.file.filename);
    
    // Analysera ljudfilen
    console.log("🔍 Analyserar ljud...");
    const analysis = await analyzeAudioFile(req.file.path);
    
    res.json({
      message: "File uploaded and analyzed!",
      file: {
        originalName: req.file.originalname,
        savedAs: req.file.filename,
        size: req.file.size,
        path: req.file.path,
      },
      analysis: analysis
    });
    
  } catch (error) {
    console.error("Analyseringsfel:", error);
    res.status(500).json({ error: "Could not analyze the file" });
  }
});

app.listen(PORT, () => {
  console.log(`Server runs on http://localhost:${PORT}`);
});