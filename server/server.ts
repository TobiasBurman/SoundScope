import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";

import { analyzeAudioFile } from "./services/audioAnalysis";
import { getAIFeedback } from "./services/aiFeedback";
import { PRESETS, PresetId } from "./services/presets";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* -------------------- Multer Setup -------------------- */

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads/");
  },
  filename: (_, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const allowed = [".wav", ".mp3", ".flac", ".m4a", ".aiff"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only audio files allowed"));
  }
});

/* -------------------- Routes -------------------- */

app.get("/", (_, res) => {
  res.json({ message: "SoundScope API running" });
});

/* -------------------- Upload + Analyze -------------------- */

app.post(
  "/api/upload",
  upload.fields([
    { name: "userMix", maxCount: 1 },
    { name: "reference", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      if (!files?.userMix) {
        return res.status(400).json({ error: "No user mix uploaded" });
      }

      const presetId = req.body.preset as PresetId | undefined;

      /* ---------- Analyze User Mix ---------- */

      const userFile = files.userMix[0];
      const userAnalysis = await analyzeAudioFile(userFile.path);

      /* ---------- Analyze Reference (Optional) ---------- */

      let referenceAnalysis = null;
      let comparison = null;

      if (files.reference?.[0]) {
        const refFile = files.reference[0];
        referenceAnalysis = await analyzeAudioFile(refFile.path);

        if (
          userAnalysis.loudness &&
          referenceAnalysis.loudness
        ) {
          comparison = {
            loudnessDiff:
              userAnalysis.loudness.integrated -
              referenceAnalysis.loudness.integrated,

            rangeDiff:
              userAnalysis.loudness.range -
              referenceAnalysis.loudness.range,

            peakDiff:
              userAnalysis.loudness.truePeak -
              referenceAnalysis.loudness.truePeak
          };
        }
      }

      /* ---------- Preset Comparison ---------- */

      let presetComparison = null;

      if (presetId && PRESETS[presetId] && userAnalysis.loudness) {
        const preset = PRESETS[presetId];

        presetComparison = {
          preset: presetId,
          targetLufs: preset.targetLufs,
          targetTruePeak: preset.maxTruePeak,

          loudnessDiff:
            userAnalysis.loudness.integrated -
            preset.targetLufs,

          truePeakDiff:
            userAnalysis.loudness.truePeak -
            preset.maxTruePeak
        };
      }

      /* ---------- AI Feedback ---------- */

      const aiFeedback = await getAIFeedback(
        userAnalysis,
        referenceAnalysis,
        presetId
      );

      /* ---------- Response ---------- */

      res.json({
        message: "Analysis complete",

        userMix: {
          file: {
            originalName: userFile.originalname,
            size: userFile.size
          },
          analysis: userAnalysis
        },

        reference: referenceAnalysis
          ? {
              file: {
                originalName: files.reference![0].originalname,
                size: files.reference![0].size
              },
              analysis: referenceAnalysis
            }
          : null,

        comparison,
        presetComparison,
        preset: presetId,
        aiFeedback
      });

    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  }
);

/* -------------------- Start Server -------------------- */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
