
import React from 'react';

interface FormattedTextProps {
  text: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text }) => {
  if (!text) return null;

  // Clean the text: remove markdown code block markers (e.g., ```markdown) and strip redundant whitespace
  const cleanText = text
    .replace(/```(?:markdown|json|text)?\n?/gi, '')
    .replace(/```/g, '')
    .trim();

  const lines = cleanText.split('\n');

  // Helper to parse bold markers (**) and return React elements
  const parseBold = (str: string) => {
    // Split by the bold pattern while capturing the delimiters
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-blue-700 dark:text-blue-300">
            {part.substring(2, part.length - 2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2 text-sm md:text-base w-full">
      {lines.map((line, idx) => {
        const trimmedLine = line.trim();
        
        // Headers (##)
        if (trimmedLine.startsWith('##')) {
          return (
            <h3 key={idx} className="text-lg font-black text-gray-900 dark:text-white pt-2 border-b border-gray-100 dark:border-gray-800 pb-1 mt-4 first:mt-0">
              {trimmedLine.replace(/^##\s*/, '')}
            </h3>
          );
        }
        
        // Single # Header support
        if (trimmedLine.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-xl font-black text-blue-600 dark:text-blue-400 pt-3 mt-4 first:mt-0">
              {trimmedLine.replace(/^#\s*/, '')}
            </h2>
          );
        }

        // List items (* or -)
        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <p className="flex-1 text-gray-700 dark:text-gray-300">
                {parseBold(trimmedLine.substring(2))}
              </p>
            </div>
          );
        }

        // Empty lines
        if (!trimmedLine) {
          return <div key={idx} className="h-1" />;
        }

        // Regular text
        return (
          <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {parseBold(line)}
          </p>
        );
      })}
    </div>
  );
};

export default FormattedText;
