import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { AppraisalDateRangePicker } from '@/components/calendar/AppraisalDateRangePicker';
import { DateRange } from 'react-day-picker';
import { Download, Image as ImageIcon, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChartToolbarProps {
  selectedRange?: DateRange;
  onRangeChange?: (range: DateRange | undefined) => void;
  onPreset?: (preset: '30d' | '90d' | 'ytd' | '12m' | 'all') => void;
  cycles?: { id: string; name: string }[];
  divisions?: { id: string; name: string }[];
  selectedCycle?: string;
  selectedDivision?: string;
  onCycleChange?: (val: string) => void;
  onDivisionChange?: (val: string) => void;
  onExportCSV?: () => void;
  onExportPNG?: () => void;
  className?: string;
}

export function ChartToolbar({
  selectedRange,
  onRangeChange,
  onPreset,
  cycles = [],
  divisions = [],
  selectedCycle,
  selectedDivision,
  onCycleChange,
  onDivisionChange,
  onExportCSV,
  onExportPNG,
  className,
}: ChartToolbarProps) {
  const presets = useMemo(() => ([
    { key: '30d', label: 'Last 30d' },
    { key: '90d', label: 'Last 90d' },
    { key: 'ytd', label: 'YTD' },
    { key: '12m', label: '12 months' },
    { key: 'all', label: 'All' },
  ] as const), []);

  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-end md:justify-between ${className || ''}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <AppraisalDateRangePicker selectedRange={selectedRange} onRangeChange={onRangeChange} label="Date range" />
        <div className="flex gap-2 md:ml-2">
          {presets.map(p => (
            <Button key={p.key} variant="outline" size="sm" onClick={() => onPreset?.(p.key)} aria-label={`Preset ${p.label}`}>
              <CalendarIcon className="mr-1 h-3 w-3" />{p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        {onCycleChange && (
          <Select value={selectedCycle} onValueChange={onCycleChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Cycle</SelectItem>
              {cycles.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {onDivisionChange && (
          <Select value={selectedDivision} onValueChange={onDivisionChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All divisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {(onExportCSV || onExportPNG) && (
          <div className="flex gap-2 md:ml-2">
            {onExportCSV && (
              <Button variant="outline" onClick={onExportCSV}>
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            )}
            {onExportPNG && (
              <Button variant="outline" onClick={onExportPNG}>
                <ImageIcon className="mr-2 h-4 w-4" /> PNG
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
