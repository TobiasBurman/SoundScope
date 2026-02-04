import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import multer from "multer";
import path from "path";
import cors from 'cors';
import { analyzeAudioFile } from './services/audioAnalysis';
import { getAIFeedback } from './services/aiFeedback';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

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
  res.json({ message: "SoundScope API WORKS!" });
});

app.post("/api/upload", upload.fields([
  { name: 'userMix', maxCount: 1 },
  { name: 'reference', maxCount: 1 }
]), async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
  if (!files.userMix) {
    return res.status(400).json({ error: "No user mix uploaded" });
  }

  try {
    console.log("📁 User mix received:", files.userMix[0].originalname);
    
    const userAnalysis = await analyzeAudioFile(files.userMix[0].path);
    
    let referenceAnalysis = null;
    let comparison = null;
    
    if (files.reference) {
      console.log("📁 Reference received:", files.reference[0].originalname);
      referenceAnalysis = await analyzeAudioFile(files.reference[0].path);
      
      if (userAnalysis.loudness && referenceAnalysis.loudness) {
        comparison = {
          loudnessDiff: userAnalysis.loudness.integrated - referenceAnalysis.loudness.integrated,
          rangeDiff: userAnalysis.loudness.range - referenceAnalysis.loudness.range,
          peakDiff: userAnalysis.loudness.truePeak - referenceAnalysis.loudness.truePeak
        };
      }
    }
    
    console.log("🤖 Getting AI feedback...");
    const aiFeedback = await getAIFeedback(userAnalysis, referenceAnalysis);
    
    res.json({
      message: "Files analyzed!",
      userMix: {
        file: {
          originalName: files.userMix[0].originalname,
          size: files.userMix[0].size
        },
        analysis: userAnalysis
      },
      reference: referenceAnalysis ? {
        file: {
          originalName: files.reference[0].originalname,
          size: files.reference[0].size
        },
        analysis: referenceAnalysis
      } : null,
      comparison: comparison,
      aiFeedback: aiFeedback
    });
    
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Could not analyze files" });
  }
});

app.listen(PORT, () => {
  console.log(`Server runs on http://localhost:${PORT}`);
});