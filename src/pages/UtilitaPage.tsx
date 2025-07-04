import React from 'react';

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 533.5 544.3"
    className="w-4 h-4"
  >
    <path fill="#4285f4" d="M533.5 278.4c0-18.5-1.5-36.3-4.4-53.6H272v101.3h146.9c-6.3 34.1-25 63-53.3 82.2v68h86.2c50.3-46.3 81.7-114.5 81.7-197.9z"/>
    <path fill="#34a853" d="M272 544.3c72.6 0 133.5-24 178-65.3l-86.2-68c-24 16-55 25.4-91.8 25.4-70 0-129.5-47.3-150.7-110.7H34v69.2C78.8 477 170.4 544.3 272 544.3z"/>
    <path fill="#fbbc04" d="M121.3 325.7c-10.4-30.8-10.4-64.8 0-95.6V160.9H34c-43.2 86.4-43.2 189.9 0 276.3l87.3-68z"/>
    <path fill="#ea4335" d="M272 107.6c39.6 0 75 13.6 103.2 40.4l77-74.7C411.3 24.3 352.7 0 272 0 170.4 0 78.8 67.3 34 164.5l87.3 68C142.5 154.9 202 107.6 272 107.6z"/>
  </svg>
);

const TeamsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="w-4 h-4"
  >
    <path fill="#6264A7" d="M43 4H5a3 3 0 0 0-3 3v34a3 3 0 0 0 3 3h38a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-6 9h-7v7h-6v-7h-7v25h7v-7h6v7h7V13z"/>
  </svg>
);

const ZoomIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-4 h-4"
  >
    <path fill="#2D8CFF" d="M6.432 0C2.882 0 0 2.882 0 6.432v11.136C0 20.118 2.882 23 6.432 23h11.136C20.118 23 23 20.118 23 17.568V6.432C23 2.882 20.118 0 17.568 0H6.432zm9.44 6.062l4.63 2.93a.324.324 0 01.158.281v5.267a.324.324 0 01-.158.281l-4.63 2.93a.324.324 0 01-.495-.281V6.343a.324.324 0 01.495-.281z"/>
  </svg>
);

export default function UtilitaPage() {
  const links = [
    { name: 'Google Meet', icon: <GoogleIcon />, url: 'https://meet.google.com/xyz-abcq-wvu' },
    { name: 'Microsoft Teams', icon: <TeamsIcon />, url: 'https://teams.microsoft.com/l/meetup-join/…' },
    { name: 'Zoom', icon: <ZoomIcon />, url: 'https://zoom.us/wc/join/123456789?pwd=abcdef' },
  ];

  return (
    <div className="p-2 grid grid-cols-1 md:grid-cols-3 gap-2">
      {links.map((svc) => (
        <a
          key={svc.name}
          href={svc.url}
          target="_blank"
          rel="noopener noreferrer"
          role="button"
          className="flex flex-col items-center justify-center border border-gray-300 rounded p-3 space-y-1 text-sm bg-transparent"
        >
          {svc.icon}
          <span className="mt-1 font-semibold">{svc.name}</span>
        </a>
      ))}
    </div>
  );
}
