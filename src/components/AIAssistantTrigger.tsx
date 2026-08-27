"use client";

import { useState, useEffect } from 'react';
import AIAssistantPanel from './AIAssistantPanel';

export default function AIAssistantTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('artha-toggle-ai-assistant', handleToggle);
    return () => {
      window.removeEventListener('artha-toggle-ai-assistant', handleToggle);
    };
  }, []);

  return (
    <AIAssistantPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
  );
}
