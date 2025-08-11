import { toPng } from 'html-to-image';
import Papa from 'papaparse';

export interface CsvOptions {
  fileName?: string;
}

export async function exportChartToPNG(element: HTMLElement | null, fileName = 'chart.png'): Promise<void> {
  if (!element) return;
  const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background') || '#ffffff' });
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

export function exportToCSV<T extends Record<string, unknown>>(rows: T[], fileName = 'data.csv'): void {
  const csv = Papa.unparse(rows, { skipEmptyLines: true });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
