'use client';

import { ExternalLink } from 'lucide-react';
import React from 'react';

// A simple regex to find URLs in a string.
const urlRegex = /(https?:\/\/[^\s]+)/g;

export function ClickableRecommendation({ text }: { text: string }) {
  if (!text) return null;

  const parts = text.split(urlRegex);

  return (
    <p className="text-sm text-muted-foreground mt-1">
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline hover:text-primary/80"
            >
              <span>link</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </p>
  );
}

  
