import type { TopbarProps } from '../types';
import { Show } from 'solid-js';

export function Topbar(props: TopbarProps) {
  return (
    <header class="h-16 bg-gray-900/80 border-b border-gray-800 backdrop-blur-sm">
      <div class="h-full px-6 flex items-center justify-between">
        {/* Title */}
        <Show when={props.title}>
          <h1 class="text-xl font-semibold text-white">{props.title}</h1>
        </Show>
        
        <div class="flex items-center gap-4">
          {/* Actions */}
          <Show when={props.actions}>
            {props.actions}
          </Show>
          
          {/* User info */}
          <Show when={props.user}>
            <div class="flex items-center gap-3 pl-4 border-l border-gray-700">
              <div class="text-right">
                <div class="text-sm font-medium text-white">{props.user!.name}</div>
                <Show when={props.user!.role}>
                  <div class="text-xs text-gray-400">{props.user!.role}</div>
                </Show>
              </div>
              
              <div class="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
                {props.user!.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
