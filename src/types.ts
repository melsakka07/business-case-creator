export interface Question {
  question: string;
  description: string;
  inputType: string;
  index: number;
  required?: boolean;
}

export interface Section {
  category: string;
  questions: Question[];
}

export interface FormData {
  [key: string]: string | string[] | File | null;
}

export interface QuestionnaireData {
  Category: string[];
  Question: string[];
  Description: string[];
  'Input Type': string[];
  Required?: boolean[];
}

export interface ValidationError {
  index: number;
  message: string;
}

interface SectionProps {
  title: string;
  questions: Question[];
  formData: { [key: string]: string | string[] | File | null };
  onInputChange: (index: number, value: string | string[] | File | null) => void;
  isActive: boolean;
  onClick: () => void;
  sectionNumber: number;
}