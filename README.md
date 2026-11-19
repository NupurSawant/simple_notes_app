# Simple Notes App - Setup and Deployment Guide

Folder layout:

```
simple-notes-app/
  backend/            (the kitchen - goes to Render)
    main.py
    requirements.txt
    .gitignore
  frontend/           (the dining area - goes to Vercel)
    index.html
    style.css
    script.js
    config.js
  README.md           (this file)
  EXPLAINED.md        (what everything means and how it works)
```

---

## PART 1 - Run everything on your own computer first

You need Python 3.9 or newer. Check with `python --version` (or `python3 --version`).

### Step 1: Start the backend

Open a terminal inside the `backend` folder and run:

```
python -m venv venv
```

Activate it:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

Then:

```
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

You should see: `Uvicorn running on http://127.0.0.1:8000`. Leave this terminal open.

### Step 2: Test the backend on its own (no frontend needed)

Open these in your browser:

| Address | What you should see |
|---|---|
| http://localhost:8000/ | A welcome message |
| http://localhost:8000/api/health | `{"status":"ok", ...}` |
| http://localhost:8000/api/greet?name=Nupur | A greeting |
| http://localhost:8000/docs | An interactive test page |

The `/docs` page is the easiest way to test. Click any endpoint, press "Try it out", fill the box, press "Execute", and read the response. Try POST /api/notes with `{"text": "my first note"}`, then GET /api/notes to see it.

Optional, using the terminal (curl):

```
curl http://localhost:8000/api/health
curl -X POST http://localhost:8000/api/notes -H "Content-Type: application/json" -d '{"text":"hello"}'
curl http://localhost:8000/api/notes
curl -X DELETE http://localhost:8000/api/notes/1
```

### Step 3: Start the frontend

Open a second terminal inside the `frontend` folder:

```
python -m http.server 5500
```

Open http://localhost:5500 in your browser.

You should see "Backend is running" in green. Try the greeting, add a note, delete a note.
Press F12 and open the Network tab to watch the API calls happen live.

---

## PART 2 - Put the code on GitHub

Render and Vercel both pull your code from GitHub.

1. Create a free account at github.com.
2. Click New repository. Name it `simple-notes-app`. Keep it Public. Click Create.
3. In a terminal inside the `simple-notes-app` folder (the one containing `backend` and `frontend`):

```
git init
git add .
git commit -m "first version"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/simple-notes-app.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

---

## PART 3 - Deploy the backend on Render

1. Go to render.com and sign up with GitHub.
2. Click New, then Web Service.
3. Choose your `simple-notes-app` repository.
4. Fill in the form exactly like this:

| Field | Value |
|---|---|
| Name | simple-notes-api |
| Language | Python 3 |
| Branch | main |
| Root Directory | backend |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | Free |

5. Click Create Web Service. Wait 2 to 4 minutes until the log says "Your service is live".
6. Copy your backend address from the top of the page. It looks like `https://simple-notes-api.onrender.com`.
7. Test it: open `https://simple-notes-api.onrender.com/api/health` and `https://simple-notes-api.onrender.com/docs`.

Note: the free plan puts the server to sleep after about 15 minutes of no use. The first visit afterwards can take up to a minute. This is normal.

---

## PART 4 - Connect the frontend to the deployed backend

Open `frontend/config.js` and replace the address:

```
const API_URL = "https://simple-notes-api.onrender.com";
```

Use your own Render address, with no slash at the end. Save, then push the change:

```
git add .
git commit -m "point frontend to Render backend"
git push
```

---

## PART 5 - Deploy the frontend on Vercel

1. Go to vercel.com and sign up with GitHub.
2. Click Add New, then Project.
3. Import your `simple-notes-app` repository.
4. Set:

| Field | Value |
|---|---|
| Framework Preset | Other |
| Root Directory | frontend (click Edit and choose the folder) |
| Build Command | leave empty |
| Output Directory | leave empty |

5. Click Deploy. In about a minute you get an address like `https://simple-notes-app.vercel.app`.
6. Open it. You should see "Backend is running" in green. Add and delete notes to confirm it works.

---

## PART 6 - Lock the backend to your website (recommended)

Right now the backend accepts requests from any website. To restrict it to yours:

1. In Render, open your service, then Environment.
2. Add a variable:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://simple-notes-app.vercel.app` (your real Vercel address, no slash at the end)
3. Save. Render restarts the service automatically.

---

## Updating later

Change code, then `git add .`, `git commit -m "message"`, `git push`. Render and Vercel both redeploy automatically.

---

## If something goes wrong

| Problem | Likely cause and fix |
|---|---|
| Page says "Could not reach the backend" | `API_URL` in config.js is wrong, has a trailing slash, or the backend is still waking up. Wait a minute and press "Check backend". |
| Browser console shows a CORS error | `ALLOWED_ORIGINS` on Render does not exactly match your Vercel address. Fix it or remove the variable. |
| Render build fails | Check Root Directory is `backend` and requirements.txt is inside it. |
| Render says "no open ports" | Start Command must include `--host 0.0.0.0 --port $PORT`. |
| Vercel shows 404 | Root Directory must be `frontend` so index.html is at the top level. |
| Notes disappear | Expected. Notes live in memory and reset when the server restarts or sleeps. |
| Changed config.js but nothing changed | Did you push to GitHub? Wait for Vercel to finish, then hard refresh (Ctrl+Shift+R). |
