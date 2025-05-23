import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import QRCode from "qrcode.react";
import "./App.css";

const socket = io("https://YOUR-BACKEND-URL.onrender.com");

function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [canvasId, setCanvasId] = useState("");
  const [mode, setMode] = useState("canvas"); // canvas or participant

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("canvas");
    if (cid) {
      setCanvasId(cid);
      setMode("participant");
    }

    socket.on("note_thrown", (note) => {
      if (note.canvasId === canvasId) {
        setNotes((prev) => [...prev, note]);
      }
    });

    socket.on("notes_clustered", (clustered) => {
      alert("Notes clustered (placeholder): " + JSON.stringify(clustered));
    });

    socket.on("canvas_report", (summary) => {
      alert("Report (placeholder):\n" + summary);
    });
  }, [canvasId]);

  const throwNote = () => {
    socket.emit("new_note", { text, id: Date.now(), canvasId });
    setText("");
  };

  const createCanvas = () => {
    const id = Math.random().toString(36).substring(2, 8);
    setCanvasId(id);
    setMode("canvas");
  };

  const clusterNotes = () => {
    socket.emit("cluster_notes", { canvasId });
  };

  const generateReport = () => {
    socket.emit("generate_report", { canvasId });
  };

  if (mode === "participant") {
    return (
      <div className="participant">
        <h2>Throw a Sticky Note</h2>
        <input
          placeholder="Type your idea"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={throwNote}>Throw</button>
      </div>
    );
  }

  return (
    <div className="canvas">
      {!canvasId && <button onClick={createCanvas}>Create Canvas</button>}
      {canvasId && (
        <>
          <h1>Canvas: {canvasId}</h1>
          <QRCode
            value={`${window.location.origin}?canvas=${canvasId}`}
            size={128}
          />
          <div className="controls">
            <button onClick={clusterNotes}>Cluster</button>
            <button onClick={generateReport}>Generate Report</button>
          </div>
          <div className="note-area">
            {notes.map((note, index) => (
              <div className="note" key={index}>
                {note.text}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
