import { saveJsonToFile } from './fileSystem';

interface QuestionnaireEntry {
  category: string;
  question: string;
  value: string | string[] | File | null;
}

export const exportFormData = async (data: QuestionnaireEntry[], projectName: string): Promise<void> => {
  try {
    // Process File objects before saving
    const processedData = data.map(entry => ({
      ...entry,
      value: entry.value instanceof File ? entry.value.name : entry.value
    }));

    const filePath = await saveJsonToFile(processedData, projectName);
    console.log(`Data exported successfully to: ${filePath}`);
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};