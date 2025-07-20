import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Import all the file type icons
import defaultIcon from '../assets/images/files/default.svg';
import imageIcon from '../assets/images/files/image.svg';
import pdfIcon from '../assets/images/files/pdf.svg';
import wordIcon from '../assets/images/files/word.svg';
import excelIcon from '../assets/images/files/excel.svg';
import pptIcon from '../assets/images/files/ppt.svg';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getAssetByType = (type: string | undefined): string => {
  if (!type) return defaultIcon;

  const typeMap: Record<string, string> = {
    'image/jpeg': imageIcon,
    'image/png': imageIcon,
    'application/pdf': pdfIcon,
    'text/plain': defaultIcon,
    'application/msword': wordIcon,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': wordIcon,
    'application/vnd.ms-excel': excelIcon,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': excelIcon,
    'application/vnd.ms-powerpoint': pptIcon,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': pptIcon,
    'text/csv': defaultIcon,
    'application/rtf': defaultIcon
  };

  return typeMap[type] || defaultIcon;
};
