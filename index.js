const express = require("express");
const { YoutubeTranscript } = require("youtube-transcript");
const path = require("path");
const serverless = require("serverless-http");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const port = 3000;

// Allow frontend to access the backend (CORS can be fine-tuned later)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Serve the HTML page when user hits the root route
app.get("/app", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Fetch transcript when the user clicks the button
app.get("/getTranscript", async (req, res) => {
  const videoId = req.query.videoId;

  if (!videoId) {
    return res.status(400).json({ error: "YouTube video ID is required" });
  }

  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const transcript = await YoutubeTranscript.fetchTranscript(videoUrl);

    // Combine transcript segments into a single string
    const transcriptText = transcript.map((item) => item.text).join(" ");

    // Return transcript as JSON
    return res.json({ transcript: transcriptText });
  } catch (error) {
    console.error("Error fetching transcript:", error);

    // Send detailed error in response (remove in production)
    return res
      .status(500)
      .json({ error: "Failed to fetch transcript", details: error.message });
  }
});

app.post("/generateBlogPost", async (req, res) => {
  const transcriptText = req.body.transcriptText;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `Generate a blog post from the following transcript:\n\n${transcriptText}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      const blogPost = data.choices[0].message.content;
      res.json({ blogPost });
    } else {
      res.status(500).json({ error: data.error.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
