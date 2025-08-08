// Placeholder NotificationSystem component
export interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function NotificationSystem({ type, message }: NotificationProps) {
  return (
    <div className={`p-4 rounded-md ${
      type === 'success' ? 'bg-green-50 text-green-700' :
      type === 'error' ? 'bg-red-50 text-red-700' :
      'bg-blue-50 text-blue-700'
    }`}>
      {message}
    </div>
  );
}