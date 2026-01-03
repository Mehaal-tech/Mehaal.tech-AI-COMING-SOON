import { For, Show, JSX } from 'solid-js';

interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => JSX.Element;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>(props: TableProps<T>) {
  return (
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-800/50 border-b border-gray-700">
          <tr>
            <For each={props.columns}>
              {(column) => (
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  {column.label}
                </th>
              )}
            </For>
          </tr>
        </thead>
        
        <tbody class="divide-y divide-gray-800">
          <Show when={!props.loading && props.data.length > 0}>
            <For each={props.data}>
              {(row) => (
                <tr 
                  class="hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => props.onRowClick?.(row)}
                >
                  <For each={props.columns}>
                    {(column) => (
                      <td class="px-6 py-4 text-sm text-gray-300">
                        {column.render 
                          ? column.render(row[column.key], row)
                          : String(row[column.key] || '-')}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </Show>
          
          <Show when={props.loading}>
            <tr>
              <td colspan={props.columns.length} class="px-6 py-12 text-center text-gray-400">
                <div class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </div>
              </td>
            </tr>
          </Show>
          
          <Show when={!props.loading && props.data.length === 0}>
            <tr>
              <td colspan={props.columns.length} class="px-6 py-12 text-center text-gray-400">
                {props.emptyMessage || 'No data available'}
              </td>
            </tr>
          </Show>
        </tbody>
      </table>
    </div>
  );
}
