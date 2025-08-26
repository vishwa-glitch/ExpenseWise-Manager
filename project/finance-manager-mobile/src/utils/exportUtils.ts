import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * Utility functions for handling file exports and blob processing
 */

export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  fileName?: string;
  mimeType?: string;
  dialogTitle?: string;
}

/**
 * Get file extension for export format
 */
export function getFileExtension(format: string): string {
  switch (format.toLowerCase()) {
    case 'excel':
      return 'xlsx';
    case 'csv':
      return 'csv';
    case 'pdf':
      return 'pdf';
    default:
      return format;
  }
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: string): string {
  switch (format.toLowerCase()) {
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Convert blob to base64 string using FileReader
 * This is the React Native compatible way to handle blobs
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const result = reader.result as string;
        // Extract the base64 part (remove data:application/octet-stream;base64, prefix)
        const base64 = result.split(',')[1];
        if (!base64) {
          reject(new Error('Failed to extract base64 data from blob'));
          return;
        }
        resolve(base64);
      } catch (error) {
        reject(new Error(`Failed to process blob data: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read blob data'));
    };
    
    reader.readAsDataURL(blob);
  });
}

/**
 * Save blob to file and share it
 */
export async function saveAndShareBlob(
  blob: Blob,
  fileName: string,
  options: ExportOptions
): Promise<void> {
  try {
    // Create file path
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    console.log('📄 Processing export blob:', {
      blobSize: blob.size,
      blobType: blob.type,
      fileName,
      fileUri,
    });
    
    // Convert blob to base64
    const base64Data = await blobToBase64(blob);
    
    console.log('✅ Blob converted to base64, writing to file...');
    
    // Write base64 data to file
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    console.log('✅ File written successfully, attempting to share...');
    
    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: options.mimeType || getMimeType(options.format),
        dialogTitle: options.dialogTitle || `Export Transactions (${options.format.toUpperCase()})`,
      });
      console.log('✅ File shared successfully');
    } else {
      Alert.alert(
        'Export Complete',
        `File saved as ${fileName}`,
        [{ text: 'OK' }]
      );
      console.log('✅ File saved (sharing not available)');
    }
  } catch (error) {
    console.error('❌ Error in saveAndShareBlob:', error);
    throw new Error(`Failed to save and share file: ${error}`);
  }
}

/**
 * Validate export blob
 */
export function validateExportBlob(blob: any): blob is Blob {
  if (!blob) {
    throw new Error('No export data received');
  }
  
  if (!(blob instanceof Blob)) {
    throw new Error('Invalid export data format: Expected Blob');
  }
  
  if (blob.size === 0) {
    throw new Error('Export data is empty');
  }
  
  return true;
}

/**
 * Generate filename for export
 */
export function generateExportFileName(
  format: string,
  startDate?: string,
  endDate?: string
): string {
  const dateSuffix = startDate && endDate 
    ? `${startDate}_to_${endDate}`
    : new Date().toISOString().split('T')[0];
  
  return `transactions_${dateSuffix}.${getFileExtension(format)}`;
}
