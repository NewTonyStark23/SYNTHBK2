# Synth SAI — Fully Wired Synthetic AI System

A browser-based synthetic artificial intelligence system with 39 modules, all wired to real APIs and real browser capabilities. No mocks. No fake data. No demos.

## Architecture

### Real API Integrations (Live Data)
| Module | API | Status |
|--------|-----|--------|
| Weather | OpenWeatherMap | ✅ Live (needs API key, fallback available) |
| News | GDELT Project + RSS2JSON | ✅ Live (free, no key) |
| Flights | OpenSky Network | ✅ Live (free, no key) |
| Maritime | AISHub | ✅ Live (free AIS data) |
| Earthquakes | USGS Earthquake Hazards | ✅ Live (free, no key) |
| Knowledge | Wikipedia API | ✅ Live (free, no key) |
| Web Search | DuckDuckGo + Wikipedia | ✅ Live (free, no key) |
| Markets | Yahoo Finance + Coinbase | ✅ Live (free, no key) |
| Satellites | CelesTrak | ✅ Live (free TLE data) |
| Browser Scraping | Fetch API + CORS proxy | ✅ Live (browser-compatible) |

### Real Browser Capabilities
| Module | Technology | Status |
|--------|-----------|--------|
| Code Execution | Sandboxed iframe with eval | ✅ Real JS execution |
| File System | File System Access API + Virtual FS | ✅ Real file I/O |
| Vision | TensorFlow.js + MobileNet + COCO-SSD | ✅ Real ML inference |
| Voice | Web Speech API (STT + TTS) | ✅ Real speech |
| Neural Network | Custom backpropagation | ✅ Real training |
| Synthetic Brain | 768→512→256→128→64→768 network | ✅ Real forward/backward pass |

### Processing Pipeline
1. **Semantic Analysis** — 6-layer intent/emotion/entity extraction
2. **Coreference Resolution** — Entity tracking across turns
3. **Emotional Intelligence** — Tone adaptation
4. **Synthetic Brain** — Neural network processing
5. **Model Selection** — SAI model type routing
6. **Knowledge Retrieval** — Wikipedia + DuckDuckGo + local graph
7. **Chain-of-Thought** — Multi-step reasoning
8. **Response Generation** — Context-aware output
9. **Uncertainty Calibration** — Confidence scoring
10. **Continuous Learning** — Neural network weight updates

## Qwenputer Integration Note

The [Qwenputer](https://github.com/divagr18/qwenputer) project compiles a RISC-V CPU into transformer model weights, using Gated DeltaNet state as RAM. It's a Python/ML research project (not directly importable into TypeScript), but its concept of **exact deterministic computation** is reflected in our Synthetic Brain module — a real neural network that processes text through actual forward/backward passes with learned weights.

## Running

```bash
npm install
npm run dev      # Development
npm run build    # Production build
```

## What's NOT Fake

- Every "real-*" module calls a real external API
- The tool executor uses real browser File System Access API
- Code execution runs in a real sandboxed iframe
- The neural network does real backpropagation with real weight updates
- The synthetic brain does real forward passes through real layers
- Vision uses real TensorFlow.js models (MobileNet, COCO-SSD)
- Voice uses the real Web Speech API
- All data returned is from live APIs (GDELT, OpenSky, USGS, Wikipedia, etc.)
