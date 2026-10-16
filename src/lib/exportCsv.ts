// ====================================================================
// HOSTELMART RFC 4180 CSV DATASET EXPORTER
// Exports listings, deal velocity, and admin notes to Excel/CSV
// ====================================================================

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

interface ExportRow {
  id: string;
  title: string;
  category: string;
  condition: string;
  price: number;
  isNegotiable: boolean;
  status: string;
  hostelBlock: string;
  roomNumber: string;
  createdAt: string;
  soldAt?: string | null;
  adminNote?: string;
}

export function generateResearchCsv(rows: ExportRow[]): string {
  if (!rows || rows.length === 0) return '';

  const headers = [
    'Listing ID',
    'Title',
    'Category',
    'Condition',
    'Price (INR)',
    'Is Negotiable',
    'Status',
    'Hostel Block',
    'Room Number',
    'Created At',
    'Sold At',
    'Time to Sell (Hours)',
    'Admin Research Notes'
  ];

  const lines = [headers.join(',')];

  for (const row of rows) {
    const timeToSell = row.soldAt && row.createdAt
      ? ((new Date(row.soldAt).getTime() - new Date(row.createdAt).getTime()) / (1000 * 60 * 60)).toFixed(1)
      : 'N/A';

    const line = [
      escapeCsvCell(row.id),
      escapeCsvCell(row.title),
      escapeCsvCell(row.category),
      escapeCsvCell(row.condition),
      escapeCsvCell(row.price),
      escapeCsvCell(row.isNegotiable ? 'YES' : 'NO'),
      escapeCsvCell(row.status),
      escapeCsvCell(row.hostelBlock),
      escapeCsvCell(row.roomNumber),
      escapeCsvCell(row.createdAt),
      escapeCsvCell(row.soldAt || 'UNSOLD'),
      escapeCsvCell(timeToSell),
      escapeCsvCell(row.adminNote || '')
    ];

    lines.push(line.join(','));
  }

  return lines.join('\r\n');
}

export function downloadCsvFile(csvContent: string, filename?: string): void {
  const name = filename || `hostelmart_research_${Date.now()}.csv`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', name);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
