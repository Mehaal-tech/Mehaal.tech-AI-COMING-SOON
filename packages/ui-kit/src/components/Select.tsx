import { For, Show, createSignal } from 'solid-js';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  class?: string;
}

export function Select(props: SelectProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  
  const selectedOption = () => props.options.find(opt => opt.value === props.value);

  return (
    <div class={`relative ${props.class || ''}`}>
      <Show when={props.label}>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">
          {props.label}
        </label>
      </Show>
      
      <button
        type="button"
        onClick={() => !props.disabled && setIsOpen(!isOpen())}
        disabled={props.disabled}
        class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
      >
        <span class={selectedOption() ? '' : 'text-gray-500'}>
          {selectedOption()?.label || props.placeholder || 'Select...'}
        </span>
        <svg 
          class="w-5 h-5 text-gray-400 transition-transform"
          classList={{ 'rotate-180': isOpen() }}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <Show when={isOpen()}>
        <div class="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-auto">
          <For each={props.options}>
            {(option) => (
              <button
                type="button"
                onClick={() => {
                  props.onChange?.(option.value);
                  setIsOpen(false);
                }}
                class="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                classList={{
                  'bg-brand-primary': option.value === props.value,
                }}
              >
                {option.label}
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
