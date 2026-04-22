# 🚗 EE250 Loop-Shaping Car Control Game

An interactive browser game for understanding **Loop-Shaping Controller Design** — from the EE250 Control Systems course, IIT Kanpur.

## 🎮 Play it

**[▶️ Open index.html in any browser — no install needed](./index.html)**

Or use GitHub Pages: go to `Settings → Pages → Deploy from main branch`

---

## 🧠 What you learn

You are the controller. Keep the car on the **golden dashed lane** while disturbances arrive.

### The 4 sliders map to real control theory:

| Slider | Concept | Effect |
|---|---|---|
| **K_low** | Low-freq gain (Kv) | Tracks reference, rejects slow disturbances |
| **ω_gc** | Crossover frequency | Speed of response |
| **dd** | Decade distance → PM ≈ 45°×dd | Stability and damping |
| **α_hf** | HF roll-off | Noise suppression |

### The 4 obstacles:

| Obstacle | Type | What to do |
|---|---|---|
| 💨 Wind Gust | Low-freq disturbance | Raise K_low |
| ⛰️ Slope | Ramp disturbance (steady-state error) | Raise K_low (Kv) |
| 📡 Sensor Glitch | High-freq noise via −T(s) | Raise α_hf |
| 🕳️ Pothole | Impulse (tests bandwidth) | Raise ω_gc |

---

## 📐 The Math

The Bode plot shows `|L(jω)|` in dB where `L(s) = C(s)G(s)`.

- **High gain at low ω** → S(jω) ≈ 0, T(jω) ≈ 1 → tracks reference, rejects disturbances
- **Low gain at high ω** → T(jω) ≈ 0 → noise not transmitted
- **Crossover at ω_gc with PM ≈ 45°×dd** → stable, well-damped response

Based on lecture notes by Abhilash Patel, EE250, IIT Kanpur.

---

## 🛠 Tech
Pure HTML/CSS/JS + Chart.js CDN. Single file, zero dependencies.
