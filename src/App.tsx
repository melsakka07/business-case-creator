import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Section } from './components/Section';
import { questionnaire_data } from './data';
import type { Section as SectionType, FormData, ValidationError } from './types';
import { ClipboardCheck, ChevronUp } from 'lucide-react';
import { Toast } from './components/Toast';
import { exportFormData } from './utils/export';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [sections, setSections] = useState<SectionType[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const groupQuestionsByCategory = useMemo(() => {
    const uniqueCategories = Array.from(new Set(questionnaire_data.Category));
    return uniqueCategories.map((category): SectionType => ({
      category,
      questions: questionnaire_data.Category.reduce<SectionType['questions']>((acc, cat, index) => {
        if (cat === category) {
          acc.push({
            question: questionnaire_data.Question[index],
            description: questionnaire_data.Description[index],
            inputType: questionnaire_data['Input Type'][index],
            index,
            required: questionnaire_data.Required?.[index] ?? false,
          });
        }
        return acc;
      }, []),
    }));
  }, []);

  useEffect(() => {
    setSections(groupQuestionsByCategory);
  }, [groupQuestionsByCategory]);

  const handleInputChange = useCallback((index: number, value: string | string[] | File | null) => {
    setFormData(prev => ({ ...prev, [index]: value }));
  }, []);

  const handleSectionClick = useCallback((index: number) => {
    setActiveSection(index);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const validateForm = useCallback((sections: SectionType[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    sections.forEach(section => {
      section.questions
        .filter(q => q.required)
        .forEach(q => {
          if (!formData[q.index]) {
            errors.push({
              index: q.index,
              message: `${q.question} is required`
            });
          }
        });
    });
    return errors;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const validationErrors = validateForm(sections);
      
      if (validationErrors.length > 0) {
        showToast('Please fill in all required fields', 'error');
        setActiveSection(sections.findIndex(s => 
          s.questions.some(q => q.index === validationErrors[0].index)
        ));
        return;
      }

      const structuredData = sections.flatMap(section => 
        section.questions.map(q => ({
          category: section.category,
          question: q.question,
          value: formData[q.index] || ''
        }))
      );

      const projectName = formData[0]?.toString() || `project_${Date.now()}`;
      
      await exportFormData(structuredData, projectName);
      showToast('Questionnaire saved successfully!', 'success');
      
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to save questionnaire data. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [sections, formData, showToast, isSubmitting, validateForm]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="bg-white p-6 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
            <ClipboardCheck className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Technical Project Questionnaire
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us understand your project better by providing information in the sections below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {sections.map((section, index) => (
              <Section
                key={section.category}
                title={section.category}
                questions={section.questions}
                formData={formData}
                onInputChange={handleInputChange}
                isActive={index === activeSection}
                onClick={() => handleSectionClick(index)}
                sectionNumber={index + 1}
              />
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-lg 
                       shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isSubmitting ? 'Submitting...' : 'Submit Questionnaire'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {showScrollTop && (
            <motion.button
              key="scroll-top"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-white/90 backdrop-blur-sm rounded-full 
                       shadow-lg hover:shadow-xl transform hover:-translate-y-1 
                       transition-all duration-200 z-50"
              aria-label="Scroll to top"
            >
              <ChevronUp className="h-6 w-6 text-indigo-600" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;