
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload, File, Code } from 'lucide-react';
import { useRef } from 'react';

interface SidebarProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadSample: () => void;
  onReset: () => void;
  theme: string;
}

const Sidebar = ({ onFileUpload, onLoadSample, onReset, theme }: SidebarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getIconColor = () => {
    return theme === 'cyberpunk' ? 'text-neon-blue hover:text-neon-violet' :
           theme === 'matrix' ? 'text-neon-green hover:text-green-400' :
           theme === 'basic' ? 'text-basic-blue hover:text-basic-dark' :
           theme === 'girly' ? 'text-girly-pink hover:text-girly-rose' :
           'text-white hover:text-blue-300';
  };

  const getButtonClass = () => {
    const baseClass = "border-2 hover:scale-105 transition-all duration-300 w-12 h-12 p-0";
    
    if (theme === 'cyberpunk') {
      return `${baseClass} glass-panel border-neon-blue/30 hover:border-neon-violet hover:neon-glow`;
    } else if (theme === 'matrix') {
      return `${baseClass} glass-panel border-neon-green/30 hover:border-neon-green`;
    } else if (theme === 'basic') {
      return `${baseClass} basic-panel border-basic-blue/30 hover:border-basic-blue basic-shadow`;
    } else if (theme === 'girly') {
      return `${baseClass} girly-panel border-girly-pink/30 hover:border-girly-rose girly-glow`;
    } else {
      return `${baseClass} glass-panel border-white/30 hover:border-blue-400`;
    }
  };

  const getSidebarClass = () => {
    const baseClass = "w-16 border-r flex flex-col items-center py-4 space-y-4 relative z-20";
    
    if (theme === 'cyberpunk') {
      return `${baseClass} glass-panel border-neon-blue/20`;
    } else if (theme === 'matrix') {
      return `${baseClass} glass-panel border-neon-green/20`;
    } else if (theme === 'basic') {
      return `${baseClass} basic-panel border-basic-blue/20`;
    } else if (theme === 'girly') {
      return `${baseClass} girly-panel border-girly-pink/20`;
    } else {
      return `${baseClass} glass-panel border-white/20`;
    }
  };

  const getThemeIcon = () => {
    return theme === 'cyberpunk' ? '🌆' :
           theme === 'matrix' ? '🔢' :
           theme === 'basic' ? '⚪' :
           theme === 'girly' ? '💕' :
           '✨';
  };

  const getThemeIndicatorClass = () => {
    const baseClass = "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold";
    
    if (theme === 'cyberpunk') {
      return `${baseClass} border-neon-blue text-neon-blue bg-neon-blue/10`;
    } else if (theme === 'matrix') {
      return `${baseClass} border-neon-green text-neon-green bg-neon-green/10`;
    } else if (theme === 'basic') {
      return `${baseClass} border-basic-blue text-basic-blue bg-basic-blue/10`;
    } else if (theme === 'girly') {
      return `${baseClass} border-girly-pink text-girly-pink bg-girly-pink/10 animate-bounce-soft`;
    } else {
      return `${baseClass} border-white text-white bg-white/10`;
    }
  };

  return (
    <TooltipProvider>
      <div className={getSidebarClass()}>
        {/* Upload File */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className={getButtonClass()}
            >
              <Upload className={`w-5 h-5 ${getIconColor()}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-50">
            <p>Upload C File</p>
          </TooltipContent>
        </Tooltip>

        {/* Sample Code */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onLoadSample}
              className={getButtonClass()}
            >
              <File className={`w-5 h-5 ${getIconColor()}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-50">
            <p>Load Sample Code</p>
          </TooltipContent>
        </Tooltip>

        {/* Reset Editor */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onReset}
              className={getButtonClass()}
            >
              <Code className={`w-5 h-5 ${getIconColor()}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-50">
            <p>Reset Editor</p>
          </TooltipContent>
        </Tooltip>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".c"
          onChange={onFileUpload}
          className="hidden"
        />

        {/* Theme indicator */}
        <div className="mt-auto">
          <div className={getThemeIndicatorClass()}>
            {getThemeIcon()}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
