const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const rateLimit = require('express-rate-limit');

// Load .env variables
dotenv.config();

// Confirm API key is loaded
if (process.env.NODE_ENV !== 'production') {
  console.log("✅ OPENAI_API_KEY Loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");
}

// Simple input sanitizer function
function sanitizeInput(text) {
  if (!text) return "";
  return text.replace(/[\n\r]/g, " ").replace(/["']/g, "");
}

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
const corsOptions = {
  origin: "https://validea-sigma.vercel.app", // remove trailing slash
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204, // some legacy browsers (IE11, various Smart TVs) choke without this
};

app.use(cors(corsOptions));

// Handle preflight OPTIONS requests
app.options("*", cors(corsOptions));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per minute
  message: {
    error: "Too many requests. Please wait and try again.",
  },
});

app.use(limiter);


// Initialize OpenAI with GPT-3.5
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// API Route: POST /evaluate
app.post('/evaluate', async (req, res) => {
  const {
    ideaSummary: rawIdeaSummary,
    targetAudience: rawTargetAudience,
    problemSolved: rawProblemSolved,
    revenueModel: rawRevenueModel,
    competitors: rawCompetitors,
    stage: rawStage = "Not provided",
    challenges: rawChallenges = "Not provided",
    vision: rawVision = "Not provided",
    team: rawTeam = "Not provided",
  } = req.body;

  // Sanitize inputs
  const ideaSummary = sanitizeInput(rawIdeaSummary);
  const targetAudience = sanitizeInput(rawTargetAudience);
  const problemSolved = sanitizeInput(rawProblemSolved);
  const revenueModel = sanitizeInput(rawRevenueModel);
  const competitors = sanitizeInput(rawCompetitors);
  const stage = sanitizeInput(rawStage);
  const challenges = sanitizeInput(rawChallenges);
  const vision = sanitizeInput(rawVision);
  const team = sanitizeInput(rawTeam);

  // Validate required fields
  if (
    !ideaSummary.trim() ||
    !targetAudience.trim() ||
    !problemSolved.trim() ||
    !revenueModel.trim() ||
    !competitors.trim()
  ) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  // Brutal Prompt with additional_insights added
const prompt = `
You are a brutally honest, elite-level venture capitalist AI analyst. Your job is to evaluate startup ideas with cold, sharp investor logic.

IMPORTANT RULES:
- Provide a detailed evaluation with multiple paragraphs for each section.
- NEVER be vague or short. Explain every point thoroughly.
- For "Feedback," summarize the overall investor impression in 3-4 sentences with reasoning.
- For "Strengths," list real, specific strengths, each explained with why it matters.
- For "Weaknesses," list concrete problems or risks, each explained clearly and with examples if possible.
- For "Recommendations," give actionable, practical advice with detailed steps or examples on how to improve the idea.
- If the idea is unclear, unrealistic, or nonsense, respond with a score of 0 and a detailed explanation of why, including how to fix it.
- Always maintain a professional, analytical, and no-nonsense tone.
- Provide a detailed, multi-paragraph evaluation.
- Be brutally honest but constructive — no sugarcoating.
- Include clear, concrete examples or scenarios where applicable.
- Identify common pitfalls and risks with explanations.
- Offer practical, actionable recommendations and strategic advice.
- Use real-world investor mindset focusing on clarity, feasibility, market fit, and scalability.
- Score the idea from 0 to 100 based on typical VC standards.


Respond ONLY in the following exact JSON format (no extra text):

{
  "score": [number between 0-100],
  "feedback": "Detailed multi-sentence paragraph with overall investor impression and reasoning.",
  "strengths": [
    "First detailed strength with explanation.",
    "Second detailed strength with explanation."
  ],
  "weaknesses": [
    "First detailed weakness with explanation and example if relevant.",
    "Second detailed weakness with explanation."
  ],
  "recommendations": [
    "First actionable recommendation with detailed advice.",
    "Second actionable recommendation with detailed advice."
  ]
}

Startup Info:
Idea Summary: ${ideaSummary.trim()}
Target Audience: ${targetAudience.trim()}
Problem Solved: ${problemSolved.trim()}
Revenue Model: ${revenueModel.trim()}
Competitors: ${competitors.trim()}
Stage: ${stage.trim()}
Challenges: ${challenges.trim()}
Vision: ${vision.trim()}
Team: ${team.trim()}
`;



  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

  
    const raw = response.choices?.[0]?.message?.content?.trim();
    let evaluation;

    try {
      evaluation = JSON.parse(raw);
    } catch {
      console.warn("⚠️ AI response was not valid JSON.");
      return res.status(200).json({ evaluation: raw });
    }

    // Validate score format
    if (
      typeof evaluation.score !== 'number' ||
      evaluation.score < 0 ||
      evaluation.score > 100
    ) {
      console.warn("⚠️ AI returned invalid score, forcing fallback structure.");
      evaluation = {
        score: 0,
        feedback: "AI returned invalid or unclear evaluation.",
        strengths: [],
        weaknesses: ["Invalid score", "Could not parse result"],
        recommendations: ["Retry with a proper, detailed idea"],
        additional_insights: []
      };
    }

    console.log("✅ Evaluation success");
    res.json({ evaluation });

  } catch (error) {
    console.error("❌ OpenAI Error:", error);
    res.status(500).json({ error: "AI evaluation failed. Please try again." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
