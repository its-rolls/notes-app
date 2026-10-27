import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "simple-notes-v1";

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function notify(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, { body });
}

export default function App() {
  const [notes, setNotes] = useState(loadNotes);
  const [text, setText] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [permission, setPermission] = useState(
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const timers = useRef({});

  // Persist notes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Schedule reminders (works while the tab/app is open)
  useEffect(() => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};

    notes.forEach((n) => {
      if (!n.remindAt || n.notified) return;
      const delay = new Date(n.remindAt).getTime() - Date.now();
      const fire = () => {
        notify("Note reminder", n.text);
        setNotes((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, notified: true } : x))
        );
      };
      if (delay <= 0) fire();
      else timers.current[n.id] = setTimeout(fire, Math.min(delay, 2147483647));
    });

    return () => Object.values(timers.current).forEach(clearTimeout);
  }, [notes.length, permission]); // eslint-disable-line react-hooks/exhaustive-deps

  async function enableNotifications() {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") notify("Notifications enabled", "You'll get note reminders here.");
  }

  function addNote(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const note = {
      id: crypto.randomUUID(),
      text: trimmed,
      remindAt: remindAt || null,
      notified: false,
      createdAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    notify("Note saved", trimmed);
    setText("");
    setRemindAt("");
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div style={styles.page}>
      <h1>Notes</h1>

      {permission === "default" && (
        <button style={styles.enable} onClick={enableNotifications}>
          🔔 Enable notifications
        </button>
      )}
      {permission === "denied" && (
        <p style={styles.warn}>
          Notifications are blocked. Allow them in your browser's site settings.
        </p>
      )}
      {permission === "unsupported" && (
        <p style={styles.warn}>This browser doesn't support notifications.</p>
      )}

      <form onSubmit={addNote} style={styles.form}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note..."
          rows={3}
          style={styles.input}
        />
        <label style={styles.label}>
          Remind me at (optional)
          <input
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            style={styles.input}
          />
        </label>
        <button type="submit" style={styles.add}>Add note</button>
      </form>

      <ul style={styles.list}>
        {notes.map((n) => (
          <li key={n.id} style={styles.note}>
            <div>
              <div>{n.text}</div>
              {n.remindAt && (
                <small style={{ color: "#666" }}>
                  ⏰ {new Date(n.remindAt).toLocaleString()}
                  {n.notified ? " (sent)" : ""}
                </small>
              )}
            </div>
            <button onClick={() => deleteNote(n.id)} style={styles.del}>✕</button>
          </li>
        ))}
        {notes.length === 0 && <li style={{ color: "#888" }}>No notes yet.</li>}
      </ul>
    </div>
  );
}

const styles = {
  page: { maxWidth: 480, margin: "2rem auto", padding: "0 1rem", fontFamily: "system-ui, sans-serif" },
  form: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  input: { padding: 8, fontSize: 16, borderRadius: 6, border: "1px solid #ccc", width: "100%", boxSizing: "border-box" },
  label: { display: "flex", flexDirection: "column", gap: 4, fontSize: 14 },
  add: { padding: 10, fontSize: 16, borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" },
  enable: { padding: 10, marginBottom: 12, borderRadius: 6, border: "1px solid #2563eb", background: "#eff6ff", cursor: "pointer" },
  warn: { background: "#fef3c7", padding: 8, borderRadius: 6 },
  list: { listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 },
  note: { display: "flex", justifyContent: "space-between", gap: 8, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 },
  del: { border: "none", background: "transparent", cursor: "pointer", fontSize: 16 },
};