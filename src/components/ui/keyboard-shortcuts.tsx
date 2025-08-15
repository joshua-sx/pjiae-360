import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMobileResponsive } from "@/hooks/use-mobile-responsive";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

interface KeyboardShortcutsProps {
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
}

export function useKeyboardShortcuts({
  enabled = true,
  shortcuts = []
}: KeyboardShortcutsProps = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile } = useMobileResponsive();

  // Default shortcuts
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: "k",
      ctrlKey: true,
      action: () => {
        // Open command palette/search
        toast({ title: "Command palette opened", description: "Ctrl+K pressed" });
      },
      description: "Open command palette",
      category: "Navigation"
    },
    {
      key: "h",
      ctrlKey: true,
      action: () => navigate("/"),
      description: "Go to dashboard",
      category: "Navigation"
    },
    {
      key: "g",
      ctrlKey: true,
      action: () => navigate("/goals"),
      description: "Go to goals",
      category: "Navigation"
    },
    {
      key: "t",
      ctrlKey: true,
      action: () => navigate("/team"),
      description: "Go to team",
      category: "Navigation"
    },
    {
      key: "n",
      ctrlKey: true,
      action: () => navigate("/new"),
      description: "Create new item",
      category: "Actions"
    },
    {
      key: "s",
      ctrlKey: true,
      action: () => {
        // Save current form/data
        toast({ title: "Saved", description: "Changes saved successfully" });
      },
      description: "Save changes",
      category: "Actions"
    },
    {
      key: "/",
      action: () => {
        // Focus search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: "Focus search",
      category: "Navigation"
    },
    {
      key: "?",
      shiftKey: true,
      action: () => {
        toast({
          title: "Keyboard Shortcuts",
          description: "Ctrl+K: Command palette, Ctrl+H: Dashboard, /: Search"
        });
      },
      description: "Show keyboard shortcuts",
      category: "Help"
    }
  ];

  const allShortcuts = [...defaultShortcuts, ...shortcuts];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || isMobile) return;

      // Don't trigger shortcuts when user is typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement).contentEditable === "true"
      ) {
        return;
      }

      for (const shortcut of allShortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
        const altMatches = !!shortcut.altKey === event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [allShortcuts, enabled, isMobile]
  );

  useEffect(() => {
    if (!enabled || isMobile) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled, isMobile]);

  return {
    shortcuts: allShortcuts,
    addShortcut: (shortcut: KeyboardShortcut) => {
      shortcuts.push(shortcut);
    }
  };
}

// Keyboard shortcuts help component
interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsHelp({
  shortcuts,
  open,
  onOpenChange
}: KeyboardShortcutsHelpProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const formatKey = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push("Ctrl");
    if (shortcut.altKey) keys.push("Alt");
    if (shortcut.shiftKey) keys.push("Shift");
    keys.push(shortcut.key.toUpperCase());
    return keys.join(" + ");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl max-h-[80vh] overflow-auto bg-background border rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Keyboard Shortcuts</h2>
            <p className="text-muted-foreground">
              Use these shortcuts to navigate and perform actions quickly.
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-medium">{category}</h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded bg-muted/50"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        {formatKey(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}