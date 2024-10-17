const { createClient } = require("@deepgram/sdk");
const fs = require("fs");
require("dotenv").config();

// Set your Deepgram API key
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const deepgram = createClient(deepgramApiKey);

// URL of the MP3 file
const audioUrl =
  "https://alpha.123tokyo.xyz/dl.php?id=ce5tWoPPRIQ&c=cdn1&u=https%3A%2F%2Fmbeta.123tokyo.xyz%2Fget.php%2F7%2F41%2Fce5tWoPPRIQ.mp3&cid=MmEwMTo0Zjg6YzAxMDo5ZmE2OjoxfE5BfERF&h=mlQ2XMPvShpx9erciFKAcg&s=1729165183&n=How%20To%20Get%20Transcript%20From%20YouTube%20Video%20-%20Full%20Guide&uT=R&uN=c3Jpbml2YXN1YXBwa25pdA%3D%3D";

async function getTranscript() {
  try {
    const response = await deepgram.listen.prerecorded.transcribeUrl(
      {
        url: audioUrl,
      },
      {
        model: "nova-2",
      }
    );

    console.log(response.result.results.channels[0].alternatives[0].transcript);
  } catch (error) {
    console.error("Error transcribing audio:", error);
  }
}

// Run the transcription
getTranscript();
