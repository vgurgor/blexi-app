/**
 * Utility functions for exporting data to different formats
 */

/**
 * Convert data to CSV format
 * @param data Array of objects to convert to CSV
 * @param headers Object mapping field names to display names
 * @returns CSV string
 */
export function convertToCSV(data: any[], headers: Record<string, string>): string {
  if (!data || !data.length) return '';
  
  // Create header row
  const headerRow = Object.values(headers).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return Object.keys(headers)
      .map(key => {
        // Get nested properties using dot notation
        const value = key.split('.').reduce((obj, key) => obj?.[key], item);
        
        // Handle special cases
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        if (value instanceof Date) return `"${value.toLocaleDateString()}"`;
        return value;
      })
      .join(',');
  });
  
  // Combine header and rows
  return [headerRow, ...rows].join('\n');
}

/**
 * Download data as a CSV file
 * @param data Array of objects to download as CSV
 * @param headers Object mapping field names to display names
 * @param filename Filename for the downloaded file
 */
export function downloadCSV(data: any[], headers: Record<string, string>, filename: string = 'export.csv'): void {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download data as an Excel file
 * This is a simplified version that actually creates a CSV file
 * For a real Excel file, you would need a library like xlsx or exceljs
 */
export function downloadExcel(data: any[], headers: Record<string, string>, filename: string = 'export.xlsx'): void {
  // In a real implementation, you would use a library like xlsx or exceljs
  // For now, we'll just create a CSV file with an xlsx extension
  downloadCSV(data, headers, filename);
}

/**
 * Download data as a PDF file
 * This is a placeholder function - in a real implementation, you would use a library like jspdf
 */
export function downloadPDF(data: any[], headers: Record<string, string>, filename: string = 'export.pdf'): void {
  // In a real implementation, you would use a library like jspdf
  // For now, we'll just show an alert
  alert('PDF export functionality would be implemented with a library like jspdf');
}

/**
 * Format data for export
 * @param data Raw data from API
 * @returns Formatted data for export
 */
export function formatDataForExport(data: any[]): any[] {
  return data.map(item => {
    // Format dates
    const checkInDate = item.checkInDate ? new Date(item.checkInDate).toLocaleDateString('tr-TR') : '';
    const checkOutDate = item.checkOutDate ? new Date(item.checkOutDate).toLocaleDateString('tr-TR') : '';
    
    // Format nested objects
    const studentName = item.guest?.person?.name || '';
    const studentSurname = item.guest?.person?.surname || '';
    const apartName = item.apart?.name || '';
    const seasonName = item.season?.name || item.seasonCode || '';
    
    // Format status
    let status = '';
    switch (item.status) {
      case 'active': status = 'Aktif'; break;
      case 'completed': status = 'Tamamlandı'; break;
      case 'cancelled': status = 'İptal Edildi'; break;
      default: status = item.status;
    }
    
    return {
      id: item.id,
      studentName: `${studentName} ${studentSurname}`.trim(),
      apartName,
      seasonName,
      checkInDate,
      checkOutDate,
      status,
      depositAmount: item.depositAmount || 0,
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : '',
    };
  });
}

/**
 * Get export headers for student registrations
 */
export function getStudentRegistrationExportHeaders(): Record<string, string> {
  return {
    'id': 'ID',
    'studentName': 'Öğrenci Adı',
    'apartName': 'Apart',
    'seasonName': 'Sezon',
    'checkInDate': 'Giriş Tarihi',
    'checkOutDate': 'Çıkış Tarihi',
    'status': 'Durum',
    'depositAmount': 'Depozito Tutarı',
    'createdAt': 'Kayıt Tarihi',
  };
}