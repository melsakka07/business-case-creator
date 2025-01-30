import { saveJsonToFile } from './fileSystem';

interface QuestionnaireEntry {
  category: string;
  question: string;
  value: string | string[] | File | null;
}

export const exportFormData = async (data: QuestionnaireEntry[], projectName: string): Promise<void> => {
  try {
    if (!projectName?.trim()) {
      throw new Error('Project name is required');
    }

    // Process File objects and ensure data is serializable
    const processedData = data.map(entry => ({
      ...entry,
      value: entry.value instanceof File ? entry.value.name : entry.value
    }));

    console.log('Sending data to server:', {
      projectName,
      dataLength: processedData.length
    });

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/save-questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName,
        data: processedData
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `Server error: ${response.status}`);
    }
    
    if (!result.success) {
      throw new Error(result.message || 'Unknown server error');
    }

    console.log('Export successful:', result);
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};