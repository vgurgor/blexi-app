import { Fragment } from 'react';
import { Trash2, AlertCircle, Ban, CheckCircle2, Settings } from 'lucide-react';

interface Action {
  icon: any;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

interface MoreActionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  actions: Action[];
}

export default function MoreActionsDropdown({ isOpen, onClose, actions }: MoreActionsDropdownProps) {
  if (!isOpen) return null;

  const getVariantStyles = (variant: Action['variant'] = 'default') => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10';
      case 'success':
        return 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10';
      default:
        return 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50';
    }
  };

  return (
    <Fragment>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
        <div className="p-1">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${getVariantStyles(action.variant)}`}
            >
              <div className={`p-2 rounded-lg ${
                action.variant === 'danger' ? 'bg-red-100 dark:bg-red-500/10' :
                action.variant === 'warning' ? 'bg-orange-100 dark:bg-orange-500/10' :
                action.variant === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10' :
                'bg-gray-100 dark:bg-gray-700'
              }`}>
                <action.icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">
                  {action.label}
                </div>
                {action.description && (
                  <div className="text-xs opacity-70">
                    {action.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Fragment>
  );
}