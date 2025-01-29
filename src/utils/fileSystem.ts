const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Creates directory if it doesn't exist and returns the full path
 */
const ensureDirectoryExists = async (dirPath: string): Promise<string> => {
  try {
    await window.apis.fs.mkdir(dirPath, { recursive: true });
    return dirPath;
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
};

/**
 * Formats date as YYYY-MM-DD_HH-mm-ss
 */
const getFormattedDateTime = (): string => {
  const now = new Date();
  return now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .split('.')[0];
};

/**
 * Sanitizes filename by removing invalid characters
 */
const sanitizeFileName = (name: string): string => {
  return name.replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
};

/**
 * Saves JSON data to server
 */
export const saveJsonToFile = async (data: any, projectName: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/save-questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
        projectName
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Unknown server error');
    }

    return result.filePath;
  } catch (error) {
    console.error('Error saving JSON file:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to server. Please ensure the server is running.');
    }
    throw error;
  }
}; 