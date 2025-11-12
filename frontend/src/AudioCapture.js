import React, { useState, useRef } from "react";

function AudioCapture({ onSentimentUpdate }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
  const DEEPGRAM_API_KEY =
    process.env.REACT_APP_DEEPGRAM_API_KEY ||
    "6123546c58fe9fab72f8c35dc92c074d88602e5f";

  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      console.log("🔵 Starting recording...");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log("✅ Microphone access granted");

      const deepgramUrl = `wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1`;

      const socket = new WebSocket(deepgramUrl, ["token", DEEPGRAM_API_KEY]);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("✅ Connected to Deepgram");

        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)({
          sampleRate: 16000,
        });
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (socket.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16Data = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            socket.send(int16Data.buffer);
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        setIsRecording(true);
        console.log("✅ Recording started");
      };

      socket.onmessage = async (message) => {
        const data = JSON.parse(message.data);
        const transcriptText = data.channel?.alternatives?.[0]?.transcript;
        const isFinal = data.is_final;
        const speechFinal = data.speech_final;

        if (transcriptText && transcriptText.trim()) {
          console.log("📝 Transcribed:", transcriptText);
          setTranscript((prev) => prev + " " + transcriptText);

          // Send to backend when we have a final transcript
          if (isFinal || speechFinal) {
            console.log("✅ Final transcript - sending to backend");

            try {
              const response = await fetch(`${BACKEND_URL}/process_text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: transcriptText }),
              });

              if (!response.ok) {
                console.error("❌ Backend error:", response.status);
                return;
              }

              const sentimentData = await response.json();
              console.log("🎯 Sentiment received:", sentimentData);

              if (onSentimentUpdate) {
                onSentimentUpdate(sentimentData);
              }
            } catch (error) {
              console.error("❌ Error calling backend:", error);
            }
          }
        }
      };

      socket.onerror = (error) => {
        console.error("❌ Deepgram error:", error);
      };

      socket.onclose = () => {
        console.log("Deepgram connection closed");
      };
    } catch (error) {
      console.error("❌ Error starting recording:", error);
      alert("Could not start recording. Check console for details.");
    }
  };

  const stopRecording = () => {
    console.log("🔴 Stopping recording...");

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setIsRecording(false);
    console.log("✅ Recording stopped");
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        position: "relative",
        zIndex: 10,
      }}
    >
      <h1
        style={{
          color: "white",
          textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
          textAlign: "center",
        }}
      >
        🎤 Sentiment Aura
      </h1>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            padding: "15px 40px",
            fontSize: "18px",
            backgroundColor: isRecording ? "#ff4444" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
            fontWeight: "bold",
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "scale(1)";
          }}
        >
          {isRecording ? "⏹ Stop Recording" : "🎤 Start Recording"}
        </button>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "12px",
          minHeight: "150px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Live Transcript:</h3>
        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.8",
            color: "#333",
          }}
        >
          {transcript || 'Click "Start Recording" and speak...'}
        </p>
      </div>
    </div>
  );
}

export default AudioCapture;
