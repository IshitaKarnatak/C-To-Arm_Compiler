
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InteractiveInputProps {
  onInput: (value: string) => void;
  prompt: string;
  theme: string;
}

const InteractiveInput = ({ onInput, prompt, theme }: InteractiveInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInput(inputValue);
    setInputValue('');
  };

  const getInputClass = () => {
    return theme === 'cyberpunk' ? 'glass-panel border-neon-blue/50 text-neon-blue' :
           theme === 'matrix' ? 'glass-panel border-neon-green/50 text-neon-green' :
           theme === 'basic' ? 'basic-panel border-basic-blue/50 text-basic-dark' :
           theme === 'girly' ? 'girly-panel border-girly-pink/50 text-girly-rose' :
           'glass-panel border-neon-blue/50';
  };

  const getButtonClass = () => {
    return theme === 'cyberpunk' ? 'bg-neon-blue hover:bg-neon-blue/80' :
           theme === 'matrix' ? 'bg-neon-green hover:bg-neon-green/80' :
           theme === 'basic' ? 'bg-basic-blue hover:bg-basic-blue/80' :
           theme === 'girly' ? 'bg-girly-pink hover:bg-girly-pink/80' :
           'bg-neon-blue hover:bg-neon-blue/80';
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-2">
      <span className={`text-sm ${
        theme === 'cyberpunk' ? 'text-neon-blue' :
        theme === 'matrix' ? 'text-neon-green' :
        theme === 'basic' ? 'text-basic-dark' :
        theme === 'girly' ? 'text-girly-rose' :
        'text-white'
      }`}>
        {prompt}
      </span>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={getInputClass()}
        placeholder="Enter input..."
        autoFocus
      />
      <Button type="submit" className={getButtonClass()}>
        Send
      </Button>
    </form>
  );
};

export default InteractiveInput;
