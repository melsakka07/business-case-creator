import React, { memo } from 'react';
import { ChevronDown, Upload } from 'lucide-react';
import { EnhanceButton } from './EnhanceButton';
import { enhanceProjectDescription } from '../services/openai';

interface QuestionInputProps {
  type: string;
  value: string | string[] | File | null;
  onChange: (value: string | string[] | File | null) => void;
  description: string;
  id: string;
  question: string;
}

import { 
  businessObjectives,
  marketSegments,
  networkComponents,
  capabilities
} from '../data/options';

const baseInputClasses = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-200 " +
                        "focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 " +
                        "hover:border-indigo-300";

const QuestionInput: React.FC<QuestionInputProps> = ({
  type,
  value,
  onChange,
  description,
  id,
  question
}) => {
  const [isEnhancing, setIsEnhancing] = React.useState(false);

  const handleEnhance = async () => {
    if (!value || typeof value !== 'string') return;
    
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceProjectDescription(value);
      onChange(enhanced);
    } catch (error) {
      console.error('Failed to enhance text:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  switch (type) {
    case 'Text Field':
      const isProjectDescription = question === 'Project Description';

      if (isProjectDescription) {
        return (
          <div className="space-y-1">
            <div className="relative">
              <textarea
                id={id}
                value={value as string || ''}
                onChange={(e) => onChange(e.target.value)}
                className={`${baseInputClasses} h-48 resize-none`}
                placeholder={description}
              />
              <div className="absolute right-3 top-3">
                {value && typeof value === 'string' && value.length > 0 && (
                  <EnhanceButton onClick={handleEnhance} loading={isEnhancing} />
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {typeof value === 'string' && (
                <span>{value.length} characters</span>
              )}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-1">
          <div className="relative">
            <input
              id={id}
              type="text"
              value={value as string || ''}
              onChange={(e) => onChange(e.target.value)}
              className={baseInputClasses}
              placeholder={description}
            />
          </div>
        </div>
      );

    case 'Dropdown':
      const options = type === 'Internal Capabilities' ? capabilities : businessObjectives;
      
      return (
        <div className="space-y-1">
          <div className="relative">
            <select
              id={id}
              value={value as string || ''}
              onChange={(e) => onChange(e.target.value)}
              className={`${baseInputClasses} appearance-none cursor-pointer`}
            >
              <option value="">Select an option</option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-500 pointer-events-none" size={20} />
          </div>
        </div>
      );

    case 'Dropdown (Multi-select)':
      const multiOptions = type.includes('Market') ? marketSegments : networkComponents;
      
      return (
        <div className="space-y-1">
          <select
            id={id}
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map(option => option.value);
              onChange(selected);
            }}
            className={`${baseInputClasses} min-h-[120px]`}
            size={4}
          >
            {multiOptions.map((option) => (
              <option key={option} value={option} className="p-2 hover:bg-indigo-50">
                {option}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl/Cmd to select multiple options
          </p>
        </div>
      );

    case 'Date Picker':
      return (
        <div className="space-y-1">
          <input
            id={id}
            type="date"
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
          />
        </div>
      );

    case 'File Upload Field':
      return (
        <div className="space-y-1">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor={id}
              className={`w-full flex flex-col items-center px-6 py-8 bg-gradient-to-br from-indigo-50 to-purple-50 
                         rounded-xl border-2 border-dashed border-indigo-300 cursor-pointer 
                         hover:bg-gradient-to-br hover:from-indigo-100 hover:to-purple-100 
                         transition-all duration-200`}
            >
              <Upload className="w-10 h-10 text-indigo-500" />
              <span className="mt-4 text-sm text-gray-600">
                {value ? (value as File).name : 'Click to upload or drag and drop'}
              </span>
              <span className="mt-2 text-xs text-gray-500">
                Supported files: PDF, DOC, DOCX, XLS, XLSX
              </span>
              <input
                id={id}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  onChange(file);
                }}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
            </label>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default memo(QuestionInput);