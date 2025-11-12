import React, { useState } from "react";
import AudioCapture from "./AudioCapture";
import AuraVisualization from "./AuraVisualization";

function App() {
  const [sentiment, setSentiment] = useState(0.5);
  const [emotion, setEmotion] = useState("neutral");
  const [keywords, setKeywords] = useState([]);

  const handleSentimentUpdate = (data) => {
    console.log("📊 Received:", data);
    setSentiment(data.sentiment || 0.5);
    setEmotion(data.emotion || "neutral");
    setKeywords(data.keywords || []);
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      happy: "😊",
      excited: "🤩",
      sad: "😢",
      angry: "😠",
      calm: "😌",
      neutral: "😐",
    };
    return emojis[emotion] || "😐";
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.7) return "#4CAF50";
    if (sentiment > 0.4) return "#FFC107";
    return "#F44336";
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Perlin Noise Visualization */}
      <AuraVisualization
        sentiment={sentiment}
        emotion={emotion}
        keywords={keywords}
      />

      <AudioCapture onSentimentUpdate={handleSentimentUpdate} />

      {/* Emotion Display */}
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          backgroundColor: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "25px 35px",
          borderRadius: "20px",
          zIndex: 1000,
        }}
      >
        <div style={{ fontSize: "60px", textAlign: "center" }}>
          {getEmotionEmoji(emotion)}
        </div>
        <div
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            textTransform: "capitalize",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          {emotion}
        </div>
      </div>

      {/* Sentiment Meter */}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: "25px",
          borderRadius: "20px",
          zIndex: 1000,
          minWidth: "200px",
        }}
      >
        <div style={{ color: "white", marginBottom: "12px", fontSize: "14px" }}>
          Sentiment Score
        </div>
        <div
          style={{
            width: "100%",
            height: "30px",
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: "15px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${sentiment * 100}%`,
              height: "100%",
              backgroundColor: getSentimentColor(sentiment),
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <div
          style={{
            color: "white",
            marginTop: "10px",
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {(sentiment * 100).toFixed(0)}%
        </div>
      </div>

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            backgroundColor: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "20px",
            zIndex: 1000,
            maxWidth: "300px",
          }}
        >
          <div style={{ fontSize: "14px", marginBottom: "12px", opacity: 0.8 }}>
            Key Topics:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {keywords.map((keyword, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: getSentimentColor(sentiment),
                  padding: "8px 15px",
                  borderRadius: "20px",
                  fontSize: "13px",
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
