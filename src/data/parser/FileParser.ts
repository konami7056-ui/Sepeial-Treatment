import * as XLSX from 'xlsx';
import { OHLCV, SymbolInfo } from '../../types/stock';
import { SymbolResolver } from '../router/SymbolResolver';

export class FileParser {
  static async parseFile(file: File): Promise<{ symbolInfo: SymbolInfo; bars: OHLCV[] }> {
    const fileName = file.name;
    const cleanSymbolName = fileName.replace(/\.[^/.]+$/, '').trim();
    const symbolInfo = SymbolResolver.resolve(cleanSymbolName);

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const bars = this.processRawRows(json);
      return { symbolInfo, bars };
    } else {
      // CSV or TXT
      const text = await file.text();
      const lines = text.split(/\r?\n/);
      const rows = lines.map(line => line.split(/,|\t|;/));
      const bars = this.processRawRows(rows);
      return { symbolInfo, bars };
    }
  }

  private static processRawRows(rows: any[][]): OHLCV[] {
    if (!rows || rows.length < 2) return [];

    let dateIdx = -1;
    let openIdx = -1;
    let highIdx = -1;
    let lowIdx = -1;
    let closeIdx = -1;
    let volIdx = -1;

    // Detect header row
    const firstRow = rows[0].map(c => String(c).toLowerCase().trim());
    for (let i = 0; i < firstRow.length; i++) {
      const col = firstRow[i];
      if (col.includes('date') || col.includes('日期') || col.includes('time')) dateIdx = i;
      else if (col.includes('open') || col.includes('開盤')) openIdx = i;
      else if (col.includes('high') || col.includes('最高')) highIdx = i;
      else if (col.includes('low') || col.includes('最低')) lowIdx = i;
      else if (col.includes('close') || col.includes('收盤')) closeIdx = i;
      else if (col.includes('vol') || col.includes('成交量') || col.includes('量')) volIdx = i;
    }

    // Default indices if no headers matched
    if (dateIdx === -1) dateIdx = 0;
    if (openIdx === -1) openIdx = 1;
    if (highIdx === -1) highIdx = 2;
    if (lowIdx === -1) lowIdx = 3;
    if (closeIdx === -1) closeIdx = 4;
    if (volIdx === -1) volIdx = 5;

    const startRowIdx = isNaN(Number(rows[0][openIdx])) ? 1 : 0;
    const bars: OHLCV[] = [];

    for (let r = startRowIdx; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 5) continue;

      const rawDate = String(row[dateIdx]).trim();
      const open = parseFloat(String(row[openIdx]));
      const high = parseFloat(String(row[highIdx]));
      const low = parseFloat(String(row[lowIdx]));
      const close = parseFloat(String(row[closeIdx]));
      const volume = volIdx < row.length ? parseFloat(String(row[volIdx])) || 0 : 0;

      if (!rawDate || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) continue;

      let formattedDate = rawDate;
      // Handle YYYY/MM/DD or YYYYMMDD or ROC date (e.g. 112/01/05)
      if (rawDate.includes('/')) {
        const parts = rawDate.split('/');
        if (parts[0].length <= 3) {
          const rocYear = parseInt(parts[0], 10);
          formattedDate = `${rocYear + 1911}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
      } else if (rawDate.length === 8 && !isNaN(Number(rawDate))) {
        formattedDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
      }

      const timestamp = new Date(formattedDate).getTime();

      bars.push({
        timestamp,
        date: formattedDate,
        open,
        high,
        low,
        close,
        volume
      });
    }

    return bars;
  }
}
