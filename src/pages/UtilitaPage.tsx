import React from 'react';
import { Button } from '@/components/ui/button';
import { Google, Microsoft, Video } from 'lucide-react';

export default function UtilitaPages() {
  const links = [
    {
      name: 'Google Meet',
      icon: <Google className="w-6 h-6" />,
      url: 'https://meet.google.com/xyz-abcq-wvu',
    },
    {
      name: 'Microsoft Teams',
      icon: <Microsoft className="w-6 h-6" />,
      url: 'https://teams.microsoft.com/l/meetup-join/…',
    },
    {
      name: 'Zoom',
      icon: <Video className="w-6 h-6" />,
      url: 'https://zoom.us/wc/join/123456789?pwd=abcdef',
    },
  ];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {links.map((svc) => (
        <Button
          key={svc.name}
          variant="outline"
          className="flex flex-col items-center p-6 space-y-2"
          onClick={() => window.open(svc.url, '_blank')}
        >
          {svc.icon}
          <span className="mt-2 font-semibold">{svc.name}</span>
        </Button>
      ))}
    </div>
  );
}
