import React, { memo, useCallback } from 'react';
import QuestionInput from './QuestionInput';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SectionProps {
  title: string;
  questions: {
    question: string;
    description: string;
    inputType: string;
    index: number;
  }[];
  formData: { [key: string]: string | string[] | File | null };
  onInputChange: (index: number, value: string | string[] | File | null) => void;
  isActive: boolean;
  onClick: () => void;
  sectionNumber: number;
}

const Section: React.FC<SectionProps> = memo(({
  title,
  questions,
  formData,
  onInputChange,
  isActive,
  onClick,
  sectionNumber,
}) => {
  const completedQuestions = questions.filter(q => formData[q.index]).length;
  const progress = (completedQuestions / questions.length) * 100;

  const handleQuestionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      role="region"
      aria-label={`Section ${sectionNumber}: ${title}`}
      aria-expanded={isActive}
      className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 cursor-pointer
                 relative ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
    >
      {/* Progress bar */}
      <div 
        className="absolute top-0 left-0 w-full h-1 bg-gray-100" 
        role="progressbar"
        aria-label={`Section ${sectionNumber} completion progress`}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="w-full px-6 py-5 flex items-center justify-between text-left 
                    bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <span 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 
                     text-indigo-600 font-semibold text-sm shrink-0" 
            aria-hidden="true"
          >
            {sectionNumber}
          </span>
          <h2 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
                       ${isActive ? 'from-indigo-600 via-purple-600 to-pink-600' : 'from-gray-600 to-gray-500'}`}>
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span 
            className="text-sm text-gray-500" 
            aria-label={`${completedQuestions} out of ${questions.length} questions completed`}
          >
            {completedQuestions} / {questions.length}
          </span>
          {completedQuestions === questions.length && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100"
              aria-label="Section completed"
              role="status"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
            </motion.span>
          )}
        </div>
      </div>
      
      <div className="p-6 space-y-6 bg-white">
        {questions.map(({ question, description, inputType, index }) => (
          <motion.div
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={handleQuestionClick}
            className="space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <label className="block" htmlFor={`question-${index}`}>
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                {question}
                {formData[index] && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                             bg-green-100 text-green-800"
                    aria-label="Question completed"
                  >
                    Completed
                  </motion.span>
                )}
              </span>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </label>
            <div className="mt-2 relative">
              <QuestionInput
                type={inputType}
                value={formData[index] || ''}
                onChange={(value) => onInputChange(index, value)}
                description={description}
                id={`question-${index}`}
                question={question}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

Section.displayName = 'Section';

export default Section;

export { Section };