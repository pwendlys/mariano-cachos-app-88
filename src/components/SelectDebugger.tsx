
import React from 'react';
import { SelectItem } from '@/components/ui/select';

interface SelectDebuggerProps {
  value: string;
  children: React.ReactNode;
}

const SelectDebugger: React.FC<SelectDebuggerProps> = ({ value, children }) => {
  console.log('SelectItem value:', value, 'isEmpty:', value === '');
  
  if (value === '') {
    console.error('SelectItem with empty string value detected!');
    return <SelectItem value="default">{children}</SelectItem>;
  }
  
  return <SelectItem value={value}>{children}</SelectItem>;
};

export default SelectDebugger;
