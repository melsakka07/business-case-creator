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

    console.log('Exporting data:', {
      projectName,
      entries: processedData.length
    });

    const filePath = await saveJsonToFile(processedData, projectName);
    console.log('Export successful:', filePath);
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};