import type { CardProps } from '../types';
import { Show } from 'solid-js';

export function Card(props: CardProps) {
  return (
    <div class={`bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm ${props.class || ''}`}>
      <Show when={props.title || props.actions}>
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <Show when={props.title}>
            <h3 class="text-lg font-semibold text-white">{props.title}</h3>
          </Show>
          <Show when={props.actions}>
            <div class="flex items-center gap-2">
              {props.actions}
            </div>
          </Show>
        </div>
      </Show>
      
      <div class="p-6">
        {props.children}
      </div>
    </div>
  );
}
