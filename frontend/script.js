// script.js - the "waiter" of our website.
// It takes what the visitor does on the page, carries it to the backend
// using fetch(), and brings the answer back to show on screen.

const statusEl = document.getElementById("status");
const checkBtn = document.getElementById("check-btn");

const nameInput = document.getElementById("name-input");
const greetBtn = document.getElementById("greet-btn");
const greetingEl = document.getElementById("greeting");

const noteInput = document.getElementById("note-input");
const addBtn = document.getElementById("add-btn");
const notesList = document.getElementById("notes-list");
const notesMessage = document.getElementById("notes-message");
const emptyEl = document.getElementById("empty");

// One helper that every API call goes through.
async function api(path, options = {}) {
  const response = await fetch(API_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong (status " + response.status + ").");
  }
  return data;
}

function setMessage(el, text, kind) {
  el.textContent = text;
  el.className = el.className.split(" ")[0] + (kind ? " " + kind : "");
}

// 1. Check the backend is alive (GET /api/health)
async function checkBackend() {
  checkBtn.disabled = true;
  setMessage(statusEl, "Checking... the free server can take up to a minute to wake up.", "");
  try {
    const data = await api("/api/health");
    setMessage(statusEl, "Backend is running. Server time: " + data.time, "ok");
  } catch (err) {
    setMessage(statusEl, "Could not reach the backend. Check API_URL in config.js.", "error");
  } finally {
    checkBtn.disabled = false;
  }
}

// 2. Greeting (GET /api/greet?name=...)
async function greet() {
  try {
    const data = await api("/api/greet?name=" + encodeURIComponent(nameInput.value));
    setMessage(greetingEl, data.greeting, "ok");
  } catch (err) {
    setMessage(greetingEl, err.message, "error");
  }
}

// 3. Notes: list, add, delete
function renderNotes(notes) {
  notesList.innerHTML = "";
  emptyEl.hidden = notes.length > 0;
  notes.forEach((note) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = note.text; // textContent keeps user input safe
    const del = document.createElement("button");
    del.className = "delete";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteNote(note.id));
    li.append(text, del);
    notesList.appendChild(li);
  });
}

async function loadNotes() {
  try {
    const data = await api("/api/notes");
    renderNotes(data.notes);
    setMessage(notesMessage, "", "");
  } catch (err) {
    setMessage(notesMessage, "Could not load notes. Is the backend running?", "error");
  }
}

async function addNote() {
  const text = noteInput.value.trim();
  if (!text) {
    setMessage(notesMessage, "Type something first.", "error");
    return;
  }
  addBtn.disabled = true;
  try {
    await api("/api/notes", { method: "POST", body: JSON.stringify({ text }) });
    noteInput.value = "";
    setMessage(notesMessage, "Note added.", "ok");
    await loadNotes();
  } catch (err) {
    setMessage(notesMessage, err.message, "error");
  } finally {
    addBtn.disabled = false;
  }
}

async function deleteNote(id) {
  try {
    await api("/api/notes/" + id, { method: "DELETE" });
    setMessage(notesMessage, "Note deleted.", "ok");
    await loadNotes();
  } catch (err) {
    setMessage(notesMessage, err.message, "error");
  }
}

// Wire buttons to functions
checkBtn.addEventListener("click", checkBackend);
greetBtn.addEventListener("click", greet);
addBtn.addEventListener("click", addNote);
noteInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addNote(); });
nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter") greet(); });

// Run once when the page opens
checkBackend();
loadNotes();
