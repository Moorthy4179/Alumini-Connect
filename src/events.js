import React from 'react';
import './events.css';
import Navbar from './navbar'; 

function Events() {
  return (
    <div className="events-page">
      <Navbar />

      <div className="events-content">
        <aside className="events-sidebar">
          <h2>GALLERY CATEGORIES</h2>
          <button>All</button>
          <button>Categories</button>
          <button>Memory Lane</button>
          <button>Reunion</button>
        </aside>

        <section className="events-gallery">
          {Array.from({ length: 15 }, (_, i) => (
            <div className="event-frame" key={i}>
              Frame {i + 1}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Events;
