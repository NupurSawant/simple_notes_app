"""
Simple Notes API  (the "kitchen" of our website)

What it does:
  - Says hello (GET /)
  - Reports that it is alive (GET /api/health)
  - Greets a person by name (GET /api/greet?name=Nupur)
  - Lets you list, add and delete notes (GET / POST / DELETE /api/notes)

Notes are kept in memory (a plain Python list), so they reset whenever the
server restarts. That is on purpose: it keeps the project simple.
"""

import os
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Simple Notes API",
    description="A tiny backend for learning how frontend and backend talk.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS: the "guest list" of websites allowed to talk to this backend.
# While testing we allow everyone ("*"). After deploying, set the environment
# variable ALLOWED_ORIGINS on Render to your Vercel URL, for example:
#   https://my-notes-app.vercel.app
# Several addresses can be separated with commas.
# ---------------------------------------------------------------------------
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# "Database": just a list living in memory.
# ---------------------------------------------------------------------------
notes = []
next_id = 1


class NoteIn(BaseModel):
    """The shape of data the frontend must send when adding a note."""
    text: str


@app.get("/")
def home():
    return {"message": "Backend is running. Visit /docs to try the API."}


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/greet")
def greet(name: str = "friend"):
    name = name.strip() or "friend"
    return {"greeting": f"Hello, {name}! The backend says hi."}


@app.get("/api/notes")
def list_notes():
    return {"count": len(notes), "notes": notes}


@app.post("/api/notes", status_code=201)
def add_note(note: NoteIn):
    global next_id
    text = note.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Note text cannot be empty.")
    if len(text) > 200:
        raise HTTPException(status_code=400, detail="Note must be 200 characters or fewer.")

    new_note = {
        "id": next_id,
        "text": text,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    notes.append(new_note)
    next_id += 1
    return new_note


@app.delete("/api/notes/{note_id}")
def delete_note(note_id: int):
    for index, note in enumerate(notes):
        if note["id"] == note_id:
            notes.pop(index)
            return {"deleted": note_id}
    raise HTTPException(status_code=404, detail="Note not found.")
