import React, { useRef, useEffect } from "react";
import Sketch from "react-p5";

function AuraVisualization({ sentiment = 0.5, emotion = "neutral" }) {
  const particles = useRef([]);
  const timeOffset = useRef(0);
  const currentSentiment = useRef(sentiment);
  const currentEmotion = useRef(emotion);
  const targetColor = useRef({ h: 140, s: 30, b: 50 });
  const currentColor = useRef({ h: 140, s: 30, b: 50 });

  useEffect(() => {
    currentSentiment.current = sentiment;
    currentEmotion.current = emotion;
    targetColor.current = getColorPalette(emotion);
  }, [sentiment, emotion]);

  const getColorPalette = (emotion) => {
    const palettes = {
      happy: { h: 50, s: 90, b: 95, secondary: 40 }, // Bright yellow/gold
      excited: { h: 320, s: 95, b: 100, secondary: 280 }, // Hot pink/purple
      sad: { h: 210, s: 70, b: 55, secondary: 230 }, // Deep blue
      angry: { h: 0, s: 95, b: 90, secondary: 15 }, // Red/orange
      calm: { h: 180, s: 60, b: 75, secondary: 200 }, // Cyan/aqua
      neutral: { h: 140, s: 35, b: 55, secondary: 160 }, // Muted green
    };
    return palettes[emotion] || palettes.neutral;
  };

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(window.innerWidth, window.innerHeight).parent(
      canvasParentRef
    );
    p5.colorMode(p5.HSB, 360, 100, 100, 100);

    // Create particles with varied sizes
    for (let i = 0; i < 60; i++) {
      particles.current.push({
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        size: p5.random(2, 10),
        speed: p5.random(0.5, 1.5),
      });
    }
  };

  const draw = (p5) => {
    // Smooth color transition
    currentColor.current.h +=
      (targetColor.current.h - currentColor.current.h) * 0.03;
    currentColor.current.s +=
      (targetColor.current.s - currentColor.current.s) * 0.03;
    currentColor.current.b +=
      (targetColor.current.b - currentColor.current.b) * 0.03;

    const colors = currentColor.current;
    const emotion = currentEmotion.current;

    // Emotion-specific backgrounds
    if (emotion === "angry") {
      // Pulsing dark red background
      const pulse = p5.sin(timeOffset.current * 3) * 10 + 10;
      p5.background(colors.h, colors.s * 0.6, pulse);
    } else if (emotion === "sad") {
      // Deep, heavy blue
      p5.background(colors.h, colors.s * 0.5, 12);
    } else if (emotion === "excited") {
      // Vibrant, energetic background
      p5.background(colors.h, colors.s * 0.4, 20);
    } else {
      // Standard background with color tint
      p5.background(colors.h, colors.s * 0.3, 15);
    }

    timeOffset.current += 0.004;

    // Map sentiment to visual properties
    const baseSpeed = p5.map(currentSentiment.current, 0, 1, 0.3, 2.5);
    const brightness = p5.map(currentSentiment.current, 0, 1, 40, 100);
    const saturation = p5.map(currentSentiment.current, 0, 1, 30, 100);

    // Emotion-specific behaviors
    let noiseScale = 0.003;
    let noiseStrength = 2;
    let connectionDistance = 100;

    switch (emotion) {
      case "angry":
        noiseScale = 0.005; // More chaotic
        noiseStrength = 3;
        connectionDistance = 80;
        break;
      case "sad":
        noiseScale = 0.002; // Slow, drifting
        noiseStrength = 1.5;
        connectionDistance = 120;
        break;
      case "excited":
        noiseScale = 0.006; // Fast, energetic
        noiseStrength = 3.5;
        connectionDistance = 130;
        break;
      case "calm":
        noiseScale = 0.0015; // Very smooth
        noiseStrength = 1.2;
        connectionDistance = 150;
        break;
      case "happy":
        noiseScale = 0.004;
        noiseStrength = 2.5;
        connectionDistance = 110;
        break;
    }

    // Draw particles
    particles.current.forEach((particle, i) => {
      // Perlin noise for organic movement
      const noiseVal = p5.noise(
        particle.x * noiseScale,
        particle.y * noiseScale,
        timeOffset.current
      );

      const angle = noiseVal * p5.TWO_PI * 4;
      const speed = baseSpeed * particle.speed * noiseStrength;
      const vx = p5.cos(angle) * speed;
      const vy = p5.sin(angle) * speed;

      particle.x += vx;
      particle.y += vy;

      // Wrap edges
      if (particle.x < 0) particle.x = p5.width;
      if (particle.x > p5.width) particle.x = 0;
      if (particle.y < 0) particle.y = p5.height;
      if (particle.y > p5.height) particle.y = 0;

      // Color variation based on position
      const hueVariation = (i % 20) * 3;
      const hue = (colors.h + hueVariation) % 360;

      // Draw glow layers
      p5.noStroke();

      // Outer glow
      p5.fill(hue, saturation * 0.5, brightness * 0.7, 15);
      p5.circle(particle.x, particle.y, particle.size * 5);

      // Middle glow
      p5.fill(hue, saturation * 0.7, brightness * 0.85, 30);
      p5.circle(particle.x, particle.y, particle.size * 2.5);

      // Core
      p5.fill(hue, saturation, brightness, 85);
      p5.circle(particle.x, particle.y, particle.size);
    });

    // Draw connections between nearby particles
    p5.strokeWeight(1.5);
    particles.current.forEach((p1, i) => {
      particles.current.slice(i + 1, i + 4).forEach((p2) => {
        const d = p5.dist(p1.x, p1.y, p2.x, p2.y);
        if (d < connectionDistance) {
          const alpha = p5.map(d, 0, connectionDistance, 40, 0);

          // Use secondary color for connections on some emotions
          let connectionHue = colors.h;
          if (emotion === "excited" || emotion === "happy") {
            connectionHue = targetColor.current.secondary;
          }

          p5.stroke(connectionHue, saturation * 0.8, brightness * 0.9, alpha);
          p5.line(p1.x, p1.y, p2.x, p2.y);
        }
      });
    });

    // Add ambient particles for certain emotions
    if (emotion === "excited" || emotion === "happy") {
      p5.noStroke();
      for (let i = 0; i < 3; i++) {
        const x = p5.random(p5.width);
        const y = p5.random(p5.height);
        const sparkleSize = p5.random(2, 5);
        p5.fill(targetColor.current.secondary, 90, 100, p5.random(30, 60));
        p5.circle(x, y, sparkleSize);
      }
    }

    // Add floating effect for calm
    if (emotion === "calm") {
      p5.noStroke();
      for (let i = 0; i < 5; i++) {
        const x = p5.noise(timeOffset.current + i) * p5.width;
        const y = p5.noise(timeOffset.current + i + 100) * p5.height;
        p5.fill(colors.h, 40, 80, 10);
        p5.circle(x, y, 30);
      }
    }
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(window.innerWidth, window.innerHeight);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    >
      <Sketch setup={setup} draw={draw} windowResized={windowResized} />
    </div>
  );
}

export default AuraVisualization;
