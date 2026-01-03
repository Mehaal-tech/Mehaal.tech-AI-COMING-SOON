import type { ButtonProps } from '../types';
import { Show } from 'solid-js';

export function Button(props: ButtonProps) {
  const variant = () => props.variant || 'primary';
  const size = () => props.size || 'md';

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:opacity-90',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white',
    ghost: 'text-brand-primary hover:bg-brand-primary/10',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      class={`${baseClasses} ${variantClasses[variant()]} ${sizeClasses[size()]} ${props.class || ''}`}
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
    >
      <Show when={props.loading}>
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </Show>
      {props.children}
    </button>
  );
}
