import { useEffect } from 'react';

export function useKeyboardControls({
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onToggleMute,
  onSetMode,
  onToggleRain,
  onToggleHideUI,
  onToggleHelp,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextTrack?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevTrack?.();
          break;
        case 'KeyM':
          e.preventDefault();
          onToggleMute?.();
          break;
        case 'Digit1':
          e.preventDefault();
          onSetMode?.('highway');
          break;
        case 'Digit2':
          e.preventDefault();
          onSetMode?.('city');
          break;
        case 'Digit3':
          e.preventDefault();
          onSetMode?.('village');
          break;
        case 'KeyR':
          e.preventDefault();
          onToggleRain?.();
          break;
        case 'KeyH':
          e.preventDefault();
          onToggleHideUI?.();
          break;
        case 'Slash':
          if (e.shiftKey) { // '?'
            e.preventDefault();
            onToggleHelp?.();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onTogglePlay,
    onNextTrack,
    onPrevTrack,
    onToggleMute,
    onSetMode,
    onToggleRain,
    onToggleHideUI,
    onToggleHelp,
  ]);
}
