# Interview Preparation Tracker

## Backend (Port 5000)
Node.js + Express + MongoDB + JWT

> **Atlas reminder:** if you're using MongoDB Atlas, make sure your current machine's
> IP address is added to the project's IP Access List before starting the server.
> After updating the whitelist you must restart the backend so it can reconnect.

### Setup
```bash
cd backend
npm install
npm run dev
```

### Environment Variables
Copy the example file and fill in your own values.

**Unix/macOS:**
```bash
cp .env.example .env
```

**Windows (PowerShell):**
```powershell
copy .env.example .env
```

Open `.env` in an editor and replace the placeholders:

```env
# MongoDB connection URI (Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/interview_preparation?retryWrites=true&w=majority

# JWT secret (long random string)
JWT_SECRET=your_jwt_secret

# Optional: custom frontend origin for CORS
FRONTEND_URL=http://localhost:3000
```

See `.env.example` for the full list of keys. **Never commit your `.env` file.**

### API Endpoints

#### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login (returns JWT) | No |
| GET | `/api/auth/profile` | Get profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |

#### Topics (Interview Tracker)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/topics` | Add preparation topic | Yes |
| GET | `/api/topics` | Get all topics (filterable) | Yes |
| GET | `/api/topics/progress` | Get progress percentage | Yes |
| PUT | `/api/topics/:id/complete` | Toggle topic complete | Yes |
| PUT | `/api/topics/:id` | Update topic | Yes |
| DELETE | `/api/topics/:id` | Delete topic | Yes |

#### Mock Interviews
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/interviews` | Record mock interview | Yes |
| GET | `/api/interviews` | Get all interviews | Yes |
| GET | `/api/interviews/:id` | Get single interview | Yes |
| PUT | `/api/interviews/:id` | Update interview | Yes |
| DELETE | `/api/interviews/:id` | Delete interview | Yes |

#### Resume
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/resume/upload` | Upload resume (PDF/DOC) | Yes |
| GET | `/api/resume` | Get stored resume data | Yes |

---

## Frontend (Port 3000)
React + Vite + Tailwind CSS

### Setup
```bash
cd frontend
npm install
npm run dev
```

### Pages
- **Login/Register** - Authentication with validation
- **Dashboard** - Progress bar, topic list, countdown, stats
- **Topics** - Add/complete/delete preparation topics
- **Interviews** - Record mock interview history
- **Resume** - Drag-and-drop upload, skill extraction
- **Profile** - Update name, company, role, interview date

### Tech Stack
- React 18 + React Router 6
- Tailwind CSS for styling
- Axios for API calls
- react-dropzone for file upload
- react-hot-toast for notifications
- lucide-react for icons
"# Interview-Preparation" 
