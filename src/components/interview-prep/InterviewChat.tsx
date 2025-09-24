'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  className?: string;
}

export default function InterviewChat({ className }: Props) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, input]);
    setInput('');
  };

  return (
    <section className={`flex flex-col h-full p-4 ${className}`}>
      <div className="flex-1 overflow-y-auto border rounded-md p-2 mb-2">
        {messages.map((msg, idx) => (
          <p key={idx} className="mb-1">
            {msg}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or record your answer..."
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </section>
  );
}
