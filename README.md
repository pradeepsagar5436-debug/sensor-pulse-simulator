# SensorPulse™ - IoT Sensor Detection Simulation & Telemetry Platform

A full-stack web application featuring an interactive **Sensor ON/OFF Detection & Simulation** frontend paired with a robust **Java Spring Boot** backend. The system accurately timestamps and logs every sensor state transition, captures simulated telemetry metrics (Core Temperature, Vibration, Battery, and Frequency), and implements enterprise-grade **JWT Authentication** with **Access Tokens**, **Refresh Tokens**, **Email Verification**, and a complete **Self-Service Password Reset** lifecycle.

---

## 🌟 Key Features

### 1. Interactive Sensor Detection & Simulation (Frontend)
- **3D Tactile Master Power Switch**: Dynamic glowing toggle button with neon state feedback (Active Cyan / Emerald vs. Standby Crimson).
- **Accurate State Timestamping**: Every switch to `ON` or `OFF` is instantly sent to the Spring Boot backend and recorded with exact timestamps, session durations, and telemetry snapshots.
- **Live Active Run Stopwatch**: Real-time ticking `HH:MM:SS` timer showing how long the sensor has been continuously running in its current state.
- **HTML5 Canvas Oscilloscope**: Real-time signal visualizer that dynamically generates active high-frequency sinusoidal waveforms when ON and flatlines to low-power standby mode when OFF.
- **Telemetry Gauges**: Monitors simulated Core Temperature (°C), Vibration Intensity (g), Battery Level (%), and Emitted RF Frequency.
- **Comprehensive History Log Table**: Searchable, filterable list of all past switch events with duration, operator email, status messages, and one-click **Export to CSV**.

### 2. Spring Boot Security & JWT Architecture (Backend)
- **Dual-Token System (Access Token + Refresh Token)**:
  - **Access Token**: Short-lived JWT (15 minutes) signed with HMAC-SHA256 (`jjwt 0.12.6`), verified on every request via `JwtAuthenticationFilter`.
  - **Refresh Token**: Long-lived secure token (7 days) stored in the database with user association, rotation, and revocation capabilities.
  - **Axios Auto-Refresh Interceptor**: Seamless token renewal on HTTP 401 without user logout or session disruption.
- **Registration with Welcome & Verification Email**: Generates a 6-digit confirmation code and dispatches a welcome email.
- **Forgot Password & Reset Password**: Generates a 15-minute time-limited OTP sent to the user's email, allowing secure password reset.
- **Change Password**: Authenticated profile endpoint with current password verification and BCrypt hashing.
- **Built-in Dev Mail Outbox**: Includes an in-app mail outbox modal (`/api/auth/outbox`) so you can test registration and OTP resets without needing external SMTP servers!

### 3. Persistent Database & Dev Console
- **H2 Persistent Database**: Runs out-of-the-box storing data in `./data/sensordb` across server restarts with zero external setup required.
- **H2 Web Console**: Inspect database tables, users, refresh tokens, and sensor logs at `http://localhost:8080/h2-console`.

---

## 🚀 How to Run the Project

### Quick Run (Windows)
Double-click `run-all.bat` in the project root:
```cmd
e:\SimulatorProject\run-all.bat
```
This automatically launches both the Spring Boot backend on port `8080` and the React frontend on port `5173`.

---

### Manual Terminal Run Commands

#### 1. Backend (Spring Boot)
Open a terminal in `e:\SimulatorProject\backend`:
```powershell
# Set Java 24 and Maven in your terminal session
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"
$env:PATH = "C:\Program Files\Java\jdk-24\bin;C:\Users\shanm\Downloads\apache-maven-3.9.11-bin\apache-maven-3.9.11\bin;" + $env:PATH

# Navigate to backend directory
cd e:\SimulatorProject\backend

# Run Spring Boot
mvn spring-boot:run
```
*Backend will start on: `http://localhost:8080`*  
*H2 Web Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/sensordb`, User: `sa`, Password: `password`)*

#### 2. Frontend (React + Vite)
Open a second terminal in `e:\SimulatorProject\frontend`:
```powershell
# Set Node.js in your terminal session
$env:PATH = "C:\Users\shanm\AppData\Local\Programs\nodejs;" + $env:PATH

# Navigate to frontend directory
cd e:\SimulatorProject\frontend

# Start Vite Development Server
npm run dev
```
*Frontend will start on: `http://localhost:5173`*

---

## 🔑 Default Credentials (Pre-seeded Demo Account)

| Role | Email | Password |
|---|---|---|
| **Admin / Operator** | `admin@sensorsimulator.com` | `Password123!` |

*(You can also use the **"⚡ Autofill Demo Credentials"** button on the Sign-In modal or register your own new account).*

---

## 📡 REST API Reference

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Public / Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account & trigger welcome email | Public |
| `POST` | `/api/auth/login` | Login and receive `accessToken` + `refreshToken` | Public |
| `POST` | `/api/auth/refresh-token` | Exchange valid `refreshToken` for a new `accessToken` | Public |
| `POST` | `/api/auth/forgot-password` | Request 6-digit password reset OTP email | Public |
| `POST` | `/api/auth/reset-password` | Verify OTP code and reset password | Public |
| `POST` | `/api/auth/change-password` | Change password with current password verification | Authenticated |
| `GET` | `/api/auth/outbox` | View simulated emails (welcome codes, OTPs) | Public |

### Sensor Simulation Endpoints (`/api/sensor`)
| Method | Endpoint | Description | Public / Auth |
|---|---|---|---|
| `POST` | `/api/sensor/toggle` | Switch sensor `ON` or `OFF`, saves timestamp & telemetry | Authenticated / Guest |
| `GET` | `/api/sensor/status` | Get current state, duration, cumulative uptime & counts | Public |
| `GET` | `/api/sensor/history` | Get recent sensor switch events (latest first) | Public |
| `DELETE` | `/api/sensor/history` | Clear sensor log history | Authenticated |

### User Profile Endpoints (`/api/user`)
| Method | Endpoint | Description | Public / Auth |
|---|---|---|---|
| `GET` | `/api/user/profile` | Get logged-in user profile, role, and joined date | Authenticated |
| `PUT` | `/api/user/profile` | Update operator full name and phone number | Authenticated |

---

## 📁 Project Architecture & Directory Layout

```text
e:\SimulatorProject\
├── backend/
│   ├── pom.xml                                   # Spring Boot 3.4.3 Maven configuration
│   ├── src/main/
│   │   ├── java/com/sensor/simulator/
│   │   │   ├── SensorSimulatorApplication.java   # Main class with demo account & sensor seeder
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java           # Spring Security 6 & CORS configuration
│   │   │   │   ├── JwtAuthenticationFilter.java  # Bearer token validation filter
│   │   │   │   └── JwtTokenProvider.java         # JJWT 0.12 token issuer & claims parser
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java           # Register, login, refresh, password reset
│   │   │   │   ├── SensorController.java         # Toggle ON/OFF, status, history logs
│   │   │   │   └── UserController.java           # User profile & details
│   │   │   ├── dto/                              # Request & Response payload transfer objects
│   │   │   ├── entity/                           # JPA Entities (User, RefreshToken, SensorLog)
│   │   │   ├── repository/                       # Spring Data JPA repositories
│   │   │   └── service/                          # AuthService, SensorService, EmailService, UserService
│   │   └── resources/
│   │       └── application.properties            # H2 DB, JWT secret, and Email settings
├── frontend/
│   ├── package.json                              # React 18, Vite 6, Lucide Icons, Axios
│   ├── vite.config.js                            # Vite config with /api proxy to port 8080
│   ├── index.html                                # HTML5 shell with Google Outfit & JetBrains Mono
│   └── src/
│       ├── index.css                             # Cyberpunk glassmorphism design system
│       ├── main.jsx                              # React DOM root
│       ├── App.jsx                               # App shell, router, toasts, modal state
│       ├── context/AuthContext.jsx               # JWT state, login, register, refresh logic
│       ├── services/api.js                       # Axios with auto 401 refresh token interceptor
│       ├── components/
│       │   ├── Navbar.jsx                        # Header with live sensor status badge
│       │   ├── SensorOscilloscope.jsx            # HTML5 Canvas real-time signal waveform
│       │   ├── AuthModal.jsx                     # Login, Register, Forgot, & Reset Password tabs
│       │   └── DevMailModal.jsx                  # Simulated mail viewer to copy OTPs & codes
│       └── pages/
│           ├── Dashboard.jsx                     # Tactile ON/OFF switch, gauges, history table
│           └── Profile.jsx                       # Operator profile & Change Password form
├── run-backend.bat                               # Double-click backend starter
├── run-frontend.bat                              # Double-click frontend starter
├── run-all.bat                                   # Double-click starter for both services
└── README.md                                     # Full documentation
```

---

## 📧 Email Service Options
The backend is configured with **dual-mode email support**:
1. **Simulation Mode (Default - Zero setup required)**:
   - All welcome emails and password reset OTP codes are automatically logged to the console and stored in memory.
   - You can click **"Mail Outbox"** in the frontend navbar anytime to view and copy OTP codes with one click!
2. **Live SMTP Mode (Optional)**:
   - In `backend/src/main/resources/application.properties`, set:
     ```properties
     app.mail.simulation-mode=false
     spring.mail.username=your-email@gmail.com
     spring.mail.password=your-app-password
     ```
   - It will immediately transmit real emails via your SMTP provider.
