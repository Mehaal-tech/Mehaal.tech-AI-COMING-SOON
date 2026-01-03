import type { ModalProps } from '../types';
import { Show, createEffect } from 'solid-js';
import { Portal } from 'solid-js/web';

export function Modal(props: ModalProps) {
  const size = () => props.size || 'md';
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  createEffect(() => {
    if (props.open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  return (
    <Show when={props.open}>
      <Portal>
        {/* Backdrop */}
        <div 
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
          onClick={props.onClose}
        />
        
        {/* Modal */}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div 
            class={`${sizeClasses[size()]} w-full bg-gray-900 border border-gray-800 rounded-xl shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Show when={props.title}>
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h2 class="text-xl font-semibold text-white">{props.title}</h2>
                <button
                  onClick={props.onClose}
                  class="text-gray-400 hover:text-white transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Show>
            
            {/* Content */}
            <div class="p-6">
              {props.children}
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
