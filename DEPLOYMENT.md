# 🚀 SensorPulse™ Live Deployment Guide

This guide details how to deploy the **SensorPulse™** full-stack IoT simulation application live on the web.

---

## 🛠️ Pre-configured Deployment Options

The project is pre-configured with **4 live deployment strategies**:

1. [Option 1: Free Cloud Hosting (Render) — Recommended](#option-1-free-cloud-hosting-render)
2. [Option 2: Free Hosting on Railway / Fly.io](#option-2-railway--flyio)
3. [Option 3: Separate Deployments (Vercel + Render/Railway)](#option-3-vercel--render)
4. [Option 4: Any VPS / Cloud Server (AWS EC2, DigitalOcean, Docker)](#option-4-vps--docker-deployment)

---

## Option 1: Free Cloud Hosting (Render)

**Render** gives you free hosting with automatic HTTPS SSL, continuous deployment from GitHub, and zero configuration.

### Steps to Deploy on Render:
1. Push your code to a **GitHub repository**.
2. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Render will automatically detect the included `Dockerfile` or `render.yaml`.
5. Click **Create Web Service**.
6. Render will build and launch your application at `https://sensor-pulse-app.onrender.com`!

---

## Option 2: Railway / Fly.io

### Deploying on Railway:
1. Go to [https://railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** -> **Deploy from GitHub Repo**.
3. Select your repository. Railway automatically reads `Dockerfile` and deploys your full-stack app.
4. Click **Generate Domain** to get your public live URL (e.g., `https://sensorpulse-production.up.railway.app`).

---

## Option 3: Separate Frontend & Backend Hosting

If you prefer hosting the React Frontend on **Vercel** or **Netlify** and the Backend on **Render** / **Railway**:

### 1. Deploy Backend:
- Push `backend/` to GitHub and deploy to Render/Railway.
- Get your backend URL: `https://your-backend-api.onrender.com`.

### 2. Deploy Frontend on Vercel:
- Import `frontend/` into [Vercel](https://vercel.com).
- Set Environment Variable in Vercel settings:
  ```env
  VITE_API_BASE_URL=https://your-backend-api.onrender.com/api
  ```
- Deploy!

---

## Option 4: VPS / Docker Deployment (AWS EC2, DigitalOcean, Hetzner)

If you own a Linux VPS or cloud server with Docker installed:

### Step 1: Clone or upload the project
```bash
git clone <your-repo-url>
cd SimulatorProject
```

### Step 2: Build and Run with Docker Compose
```bash
docker compose up -d --build
```
Your application will be live at `http://<YOUR_SERVER_IP>:8080`.

---

## 📦 Local Production Build Verification

To test the full-stack production bundle locally on Windows before uploading:

1. Double-click `build-production.bat` (or run `./build-production.sh` on Linux/macOS).
2. The script builds React and embeds all production assets into the Spring Boot backend jar.
