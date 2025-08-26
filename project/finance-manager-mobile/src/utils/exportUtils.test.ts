import { getMimeType, validateExportBlob, generateExportFileName, getFileExtension } from './exportUtils';

describe('Export Utils', () => {
  describe('getFileExtension', () => {
    it('should return correct file extension for Excel', () => {
      expect(getFileExtension('excel')).toBe('xlsx');
    });

    it('should return correct file extension for CSV', () => {
      expect(getFileExtension('csv')).toBe('csv');
    });

    it('should return correct file extension for PDF', () => {
      expect(getFileExtension('pdf')).toBe('pdf');
    });

    it('should return format as extension for unknown format', () => {
      expect(getFileExtension('unknown')).toBe('unknown');
    });

    it('should handle case insensitive format', () => {
      expect(getFileExtension('EXCEL')).toBe('xlsx');
      expect(getFileExtension('Csv')).toBe('csv');
    });
  });

  describe('getMimeType', () => {
    it('should return correct MIME type for Excel', () => {
      expect(getMimeType('excel')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('should return correct MIME type for CSV', () => {
      expect(getMimeType('csv')).toBe('text/csv');
    });

    it('should return correct MIME type for PDF', () => {
      expect(getMimeType('pdf')).toBe('application/pdf');
    });

    it('should return default MIME type for unknown format', () => {
      expect(getMimeType('unknown')).toBe('application/octet-stream');
    });

    it('should handle case insensitive format', () => {
      expect(getMimeType('EXCEL')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(getMimeType('Csv')).toBe('text/csv');
    });
  });

  describe('validateExportBlob', () => {
    it('should throw error for null blob', () => {
      expect(() => validateExportBlob(null)).toThrow('No export data received');
    });

    it('should throw error for undefined blob', () => {
      expect(() => validateExportBlob(undefined)).toThrow('No export data received');
    });

    it('should throw error for non-blob data', () => {
      expect(() => validateExportBlob('not a blob')).toThrow('Invalid export data format: Expected Blob');
    });

    it('should throw error for empty blob', () => {
      const emptyBlob = new Blob([], { type: 'text/csv', lastModified: Date.now() });
      expect(() => validateExportBlob(emptyBlob)).toThrow('Export data is empty');
    });

    it('should return true for valid blob', () => {
      const validBlob = new Blob(['test data'], { type: 'text/csv', lastModified: Date.now() });
      expect(validateExportBlob(validBlob)).toBe(true);
    });
  });

  describe('generateExportFileName', () => {
    it('should generate filename with date range', () => {
      const fileName = generateExportFileName('csv', '2024-01-01', '2024-01-31');
      expect(fileName).toBe('transactions_2024-01-01_to_2024-01-31.csv');
    });

    it('should generate filename with current date when no dates provided', () => {
      const fileName = generateExportFileName('excel');
      const today = new Date().toISOString().split('T')[0];
      expect(fileName).toBe(`transactions_${today}.xlsx`);
    });

    it('should handle different formats', () => {
      expect(generateExportFileName('pdf', '2024-01-01', '2024-01-31')).toBe('transactions_2024-01-01_to_2024-01-31.pdf');
      expect(generateExportFileName('excel', '2024-01-01', '2024-01-31')).toBe('transactions_2024-01-01_to_2024-01-31.xlsx');
    });
  });
});
