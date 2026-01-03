import type { SidebarProps, SidebarItem } from '../types';
import { For, Show } from 'solid-js';

export function Sidebar(props: SidebarProps) {
  return (
    <aside class="w-64 bg-gray-900/80 border-r border-gray-800 backdrop-blur-sm">
      <div class="flex flex-col h-full">
        {/* Logo area */}
        <div class="px-6 py-5 border-b border-gray-800">
          <img src="/icon.svg" alt="Logo" class="h-8 w-auto" />
        </div>
        
        {/* Navigation */}
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <For each={props.items}>
            {(item) => <SidebarItemComponent item={item} active={props.activeItem === item.id} onClick={props.onItemClick} />}
          </For>
        </nav>
      </div>
    </aside>
  );
}

function SidebarItemComponent(props: { item: SidebarItem; active: boolean; onClick?: (id: string) => void }) {
  return (
    <div>
      <a
        href={props.item.href || '#'}
        onClick={(e) => {
          if (!props.item.href) {
            e.preventDefault();
            props.onClick?.(props.item.id);
          }
        }}
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        classList={{
          'bg-brand-primary text-white': props.active,
          'text-gray-400 hover:text-white hover:bg-gray-800': !props.active,
        }}
      >
        <Show when={props.item.icon}>
          {props.item.icon}
        </Show>
        <span>{props.item.label}</span>
      </a>
      
      <Show when={props.item.children && props.item.children.length > 0}>
        <div class="ml-4 mt-1 space-y-1">
          <For each={props.item.children}>
            {(child) => <SidebarItemComponent item={child} active={false} onClick={props.onClick} />}
          </For>
        </div>
      </Show>
    </div>
  );
}
