
import React from 'react';
import { SelectItem } from '@/components/ui/select';

interface SelectDebuggerProps {
  value: string;
  children: React.ReactNode;
}

const SelectDebugger: React.FC<SelectDebuggerProps> = ({ value, children }) => {
  console.log('SelectItem value:', value, 'type:', typeof value, 'isEmpty:', value === '', 'isNull:', value === null, 'isUndefined:', value === undefined);
  
  if (!value || value === '' || value.trim() === '') {
    console.error('SelectItem with invalid value detected! Value:', value);
    return null; // Don't render the SelectItem at all if value is invalid
  }
  
  return <SelectItem value={value}>{children}</SelectItem>;
};

export default SelectDebugger;
