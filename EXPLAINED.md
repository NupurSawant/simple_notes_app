# Simple Notes App - Everything Explained

## 1. The big picture: a restaurant

| Restaurant | Our project | Where it lives |
|---|---|---|
| Dining area and menu (what guests see) | Frontend: index.html, style.css, script.js | Vercel |
| Kitchen (where the real work happens) | Backend: main.py | Render |
| Waiter (carries orders and food) | API calls using fetch() | The internet |
| Pantry (where ingredients are stored) | The `notes` list in main.py | Inside the backend |

A guest never walks into the kitchen. They tell the waiter what they want, the waiter takes it to the kitchen, and brings back the result. Your website works the same way.

## 2. Words you will keep hearing

**Frontend**: the part you see and click in the browser. Built with HTML (structure), CSS (looks), JavaScript (behaviour).

**Backend**: a program running on a server somewhere. It stores data, applies rules, and answers requests. People never see it directly.

**API (Application Programming Interface)**: the menu of things the backend is willing to do. Ours offers: check health, greet, list notes, add a note, delete a note.

**Endpoint**: one item on that menu, written as an address. Example: `/api/notes`.

**Request and response**: the frontend sends a request ("please add this note"), the backend sends back a response ("done, here is the saved note").

**HTTP methods**: the type of order.
- GET = "give me something" (read)
- POST = "here is something new, store it" (create)
- DELETE = "remove this" (delete)

**Status codes**: a number in every response telling how it went.
- 200 = OK
- 201 = Created
- 400 = You sent something wrong (for example an empty note)
- 404 = Not found
- 422 = Data had the wrong shape

**JSON**: the language the waiter speaks. A simple text format such as `{"text": "buy milk"}`. Both sides understand it.

**CORS**: a browser safety rule. A browser will not let a website at address A talk to a backend at address B unless B says "A is on my guest list". Our backend gives that permission using `CORSMiddleware`. Without it you would see a red CORS error in the browser.

**Environment variable**: a setting kept outside the code, in the hosting dashboard. We use `ALLOWED_ORIGINS` so the guest list can change without editing code.

**Deployment**: copying your code onto a computer that stays on all the time, so other people can use it.

**Localhost**: your own computer pretending to be a server. `localhost:8000` means "this computer, door number 8000".

## 3. File by file

### backend/main.py

- `app = FastAPI(...)` creates the backend. FastAPI is a Python tool that makes building APIs easy.
- `CORSMiddleware` sets the guest list described above.
- `notes = []` is our pantry. It is only a Python list, so it empties when the server restarts. A real project would use a database.
- `class NoteIn` describes what a new note must look like: it must have `text`. FastAPI automatically rejects anything else.
- `@app.get("/api/notes")` means: when someone sends a GET request to `/api/notes`, run the function below it. The function returns Python data and FastAPI turns it into JSON.
- `@app.post("/api/notes")` adds a note after checking it is not empty and not too long.
- `@app.delete("/api/notes/{note_id}")` removes the note whose id matches. If none matches, it replies 404.
- `/docs` is created automatically by FastAPI. It is a free testing page for your API.

### backend/requirements.txt

The shopping list of Python packages the backend needs. Render reads it and installs everything before starting.

### frontend/index.html

The skeleton of the page: headings, boxes, text fields and buttons. Every element that JavaScript needs to control has an `id`, like name tags.

### frontend/style.css

Colours, spacing, fonts. It changes how things look, never what they do. The colours are defined once at the top (`--accent`, `--bg`) so you can restyle the whole page by changing a few lines.

### frontend/config.js

One line: the address of the backend. Kept separate so that switching between local and deployed is a one-line change.

### frontend/script.js

The waiter. Key parts:
- `api(path, options)`: one helper that sends every request to `API_URL + path` and turns errors into readable messages.
- `checkBackend()`: calls `/api/health` and shows green text if it works.
- `greet()`: calls `/api/greet?name=...`.
- `loadNotes()`, `addNote()`, `deleteNote()`: call the notes endpoints, then redraw the list.
- `addEventListener(...)`: says "when this button is clicked, run that function".

## 4. What happens when you click "Add note"

1. You type "buy milk" and click Add note.
2. `addNote()` in script.js reads the text and checks it is not empty.
3. `fetch()` sends a POST request to `https://your-backend/api/notes` with the body `{"text": "buy milk"}`.
4. The browser checks CORS. The backend's guest list allows your site, so the request goes through.
5. main.py receives it, checks the text, gives it an id, saves it in the `notes` list, and replies 201 with the saved note.
6. script.js then calls `loadNotes()`, which sends a GET request to `/api/notes`.
7. The backend replies with all notes as JSON.
8. `renderNotes()` builds the list items on the page and you see "buy milk".

You can watch steps 3 to 7 in your browser: press F12, open the Network tab, then add a note.

## 5. How the deployment works

- You push code to GitHub (a storage locker for code).
- Render watches the `backend` folder. On every push it runs the Build Command (install packages) and then the Start Command (run the server). It gives you a public address.
- Vercel watches the `frontend` folder. Since there is nothing to build, it just publishes the files and gives you a public address.
- A visitor opens the Vercel address. Their browser downloads the page and its JavaScript. That JavaScript then calls the Render address.

Two separate places, connected only by the `API_URL` line in config.js and the `ALLOWED_ORIGINS` setting on Render.

## 5. Limits of this simple version

- Notes are stored in memory and vanish on restart or when the free server sleeps. A database such as SQLite or PostgreSQL fixes that.
- Everyone sees the same notes. There are no user accounts or logins.
- The free Render server sleeps after inactivity, so the first request can be slow.

## 6. Ideas to practise next

1. Add a field to notes (for example a category) in main.py and show it in script.js.
2. Add an "edit note" feature with a PUT endpoint.
3. Replace the notes list with a SQLite database.
4. Change the colours in style.css and watch the page update.
