import React from 'react';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="w-6 h-6">
    <path fill="#4285f4" d="M533.5 278.4c0-18.5-1.5-36.3-4.4-53.6H272v101.3h146.9"/>
    {/* completa con i path ufficiali */}
  </svg>
);

const TeamsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
    <path fill="#6264A7" d="M43 4H5C3.3 4 2 5.3..."/>
    {/* altri path */}
  </svg>
);

const ZoomIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="#2D8CFF" d="M17 11.5V8c0-1.1-..."/>
  </svg>
);

export default function UtilitaPage() {
  const links = [
    { name: 'Google Meet', icon: <GoogleIcon />, url: 'https://meet.google.com/xyz-abcq-wvu' },
    { name: 'Microsoft Teams', icon: <TeamsIcon />, url: 'https://teams.microsoft.com/l/meetup-join/…' },
    { name: 'Zoom', icon: <ZoomIcon />, url: 'https://zoom.us/wc/join/123456789?pwd=abcdef' },
  ];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {links.map((svc) => (
        <a
          key={svc.name}
          href={svc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded border border-gray-300 bg-transparent flex flex-col items-center p-6 space-y-2"
        >
          {svc.icon}
          <span className="mt-2 font-semibold">{svc.name}</span>
        </a>
      ))}
    </div>
  );
}
