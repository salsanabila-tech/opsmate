type Props = {
  isActive: boolean;
};

export function TechnicianStatusBadge({ isActive }: Props) {
  return (
    <span className={['inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'].join(' ')}>
      {isActive ? 'Aktif' : 'Tidak Aktif'}
    </span>
  );
}
