import type { InputProps } from '../types';
import { Show } from 'solid-js';

export function Input(props: InputProps) {
  return (
    <div class={`flex flex-col gap-1.5 ${props.class || ''}`}>
      <Show when={props.label}>
        <label class="text-sm font-medium text-gray-300">
          {props.label}
          <Show when={props.required}>
            <span class="text-red-500 ml-1">*</span>
          </Show>
        </label>
      </Show>
      
      <input
        type={props.type || 'text'}
        placeholder={props.placeholder}
        value={props.value}
        disabled={props.disabled}
        required={props.required}
        onInput={(e) => props.onInput?.(e.currentTarget.value)}
        class="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        classList={{
          'border-red-500 focus:ring-red-500': !!props.error,
        }}
      />
      
      <Show when={props.error}>
        <span class="text-sm text-red-500">{props.error}</span>
      </Show>
    </div>
  );
}
