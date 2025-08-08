// Placeholder SaveStatusIndicator component
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
}

export function SaveStatusIndicator({ status, lastSaved }: SaveStatusIndicatorProps) {
  return (
    <div className="text-sm text-muted-foreground">
      {status === 'saving' && 'Saving...'}
      {status === 'saved' && 'Saved'}
      {status === 'error' && 'Save failed'}
      {lastSaved && status === 'idle' && `Last saved: ${lastSaved.toLocaleTimeString()}`}
    </div>
  );
}