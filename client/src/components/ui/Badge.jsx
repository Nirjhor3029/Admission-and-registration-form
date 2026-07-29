const statusColors = {
  pending: 'bg-gray-100 text-gray-700',
  payment_under_review: 'bg-amber-100 text-amber-800',
  under_review: 'bg-amber-100 text-amber-800',
  payment_verified: 'bg-blue-100 text-blue-800',
  verified: 'bg-blue-100 text-blue-800',
  admitted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-700',
  open: 'bg-blue-100 text-blue-800',
  full: 'bg-red-100 text-red-800',
  started: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  upcoming: 'bg-gray-100 text-gray-700',
  paid: 'bg-green-100 text-green-800',
};

export default function Badge({ status, children, className = '' }) {
  const color = statusColors[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`px-3 py-1 rounded-pill text-label-sm font-semibold ${color} ${className}`}>
      {children || status?.replace(/_/g, ' ')}
    </span>
  );
}
