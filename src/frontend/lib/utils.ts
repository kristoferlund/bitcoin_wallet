import { toast } from '@/hooks/use-toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function copyToClipboard(address: string) {
  navigator.clipboard.writeText(address);
  toast({ title: 'Copied' });
}
