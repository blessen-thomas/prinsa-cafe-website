import { Coffee } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeMap = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' };

export default function LoadingSpinner({ size = 'md', text = 'Brewing...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Coffee className={`${sizeMap[size]} text-burgundy-800 animate-spin`} />
      <p className="text-warm-gray text-sm font-medium">{text}</p>
    </div>
  );
}
