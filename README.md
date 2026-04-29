# ⚡️ MARKIFY INTELLIGENCE

**Next-Generation Biometric Attendance & Behavioral Analytics.**

Markify is a high-fidelity, enterprise-grade attendance intelligence system that replaces manual tracking with real-time AI face recognition. Inspired by the design aesthetics of Nike, Linear, and Vercel, Markify provides a premium, low-latency experience for modern institutions.

---

## 🚀 Core Features

### 1. Biometric Registry
Enroll students instantly using browser-based face-api.js. Each student is stored with a unique 128-float biometric descriptor, ensuring secure and accurate identification without storing actual images.

### 2. Instant Auto-Identification
The scanner (`/attendance`) uses high-frequency AI inference (50ms intervals) to automatically identify registered students. No manual entry required—just look and mark.

### 3. System Control Dashboard
A high-density analytics hub providing:
- **Attendance Mix**: Real-time distribution of On-Time vs. Late arrivals.
- **Behavioral Insights**: AI-generated radar notifications identifying late-coming patterns and students at risk of chronic absenteeism.
- **Session Management**: Dynamic cutoff times and session-specific tracking.

### 4. Smart Enrollment Prompt
Integrated AI suggestions that detect unrecognized faces and proactively prompt new students to enroll, ensuring 100% registry coverage over time.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **AI Engine**: [@vladmandic/face-api](https://github.com/vladmandic/face-api) (TensorFlow.js)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Analytics**: [Recharts](https://recharts.org/)
- **Styling**: Vanilla CSS with custom Nike-inspired Design Tokens (`globals.css`)

---

## 📦 Installation & Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **AI Models**
   Ensure the `public/models` directory contains the required face-api.js weights:
   - `tiny_face_detector_model`
   - `face_landmark_68_model`
   - `face_recognition_model`

3. **Development**
   ```bash
   npm run dev
   ```

---

## 🎨 Design Philosophy

Markify adheres to a **"Brutal-Premium"** aesthetic:
- **Surface & Depth**: High-contrast glassmorphism with subtle borders and deep shadows.
- **Typography**: Heavy, tracking-tight headings (Inter/Nike style) paired with monospace utility labels.
- **Interaction**: Micro-animations on hover and active states using spring physics.
- **Color Constraint**: Primarily Monochrome (Nike Black/White) with high-saturation status signals (Nike Green/Red).

---

## 🔒 Security & Privacy

Markify is **Local-First**. All biometric processing happens in the user's browser. Biometric descriptors are stored in `localStorage` and are never transmitted to an external server in the current implementation.

---

## 📄 License

Proprietary. Developed for Advanced Institutional Management. © 2026 Markify Systems.
