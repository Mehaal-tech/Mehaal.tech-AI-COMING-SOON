import type { JSX } from 'solid-js';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: JSX.Element;
  onClick?: () => void;
  class?: string;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  onInput?: (value: string) => void;
  class?: string;
}

export interface CardProps {
  title?: string;
  children: JSX.Element;
  class?: string;
  actions?: JSX.Element;
}

export interface ModalProps {
  open: boolean;
  title?: string;
  children: JSX.Element;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (id: string) => void;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: JSX.Element;
  href?: string;
  children?: SidebarItem[];
}

export interface TopbarProps {
  title?: string;
  actions?: JSX.Element;
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
}
