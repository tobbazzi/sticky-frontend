
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    socket.on('initial_notes', (existingNotes) => {
      setNotes(existingNotes);
    });

    socket.on('note_thrown', (note) => {
      setNotes((prev) => [...prev, note]);
    });

    socket.on('notes_clustered', (clusters) => {
      console.log('Clusters:', clusters);
    });

    return () => {
      socket.off();
    };
  }, []);

  const throwNote = () => {
    const note = { text, id: Date.now() };
    socket.emit('new_note', note);
    setText('');
  };

  const clusterNotes = () => {
    socket.emit('cluster_notes');
  };

  return (
    <div>
      <h1>Sticky Notes Workshop</h1>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your note"
      />
      <button onClick={throwNote}>Throw</button>
      <button onClick={clusterNotes}>Cluster</button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.text}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
