import React, { useState } from 'react';
import './ListPages.css';
import { TEAMS_URL } from '../constants';

export default function UtilitaPage() {
  const [active, setActive] = useState<'meet' | 'teams' | 'zoom'>('meet');


  const meetUrl = 'https://meet.google.com/landing?pli=1';
  const teamsUrl = TEAMS_URL;
  const zoomUrl = 'https://zoom.us/it/signin#/login';

  return (
    <div className="list-page">
      <h2>Utilità</h2>
      <div className="tabs">
        <button
          data-testid="tab-meet"
          className={`tab-button ${active === 'meet' ? 'active' : ''}`}
          onClick={() => setActive('meet')}
        >
          <img src="/meet.png" alt="Google Meet" className="tab-icon" />
          <span>Meet</span>
        </button>
        <button
          data-testid="tab-teams"
          className={`tab-button ${active === 'teams' ? 'active' : ''}`}
          onClick={() => setActive('teams')}
        >
          <img src="/teams.png" alt="Microsoft Teams" className="tab-icon" />
          <span>Teams</span>
        </button>
        <button
          data-testid="tab-zoom"
          className={`tab-button ${active === 'zoom' ? 'active' : ''}`}
          onClick={() => setActive('zoom')}
        >
          <img src="/zoom.png" alt="Zoom" className="tab-icon" />
          <span>Zoom</span>
        </button>
      </div>
      <div className="iframe-container">
        {active === 'meet' && (
          <iframe
            title="Google Meet"
            src={meetUrl}
            allow="camera; microphone; fullscreen"
          />
        )}
        {active === 'teams' && (
          <iframe
            title="Microsoft Teams"
            src={teamsUrl}
            allow="camera; microphone; fullscreen"
          />
        )}
        {active === 'zoom' && (
          <iframe
            title="Zoom"
            src={zoomUrl}
            allow="camera; microphone; fullscreen"
          />
        )}
      </div>
    </div>
  );
}
