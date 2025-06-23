import { useNotificheStore } from '../store/notifiche';
export default function Header() {
  const count = useNotificheStore(s => s.count);
  return (
    <header className="flex items-center justify-between p-4 bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <h1 className="text-lg font-semibold tracking-wide">POLIZIA LOCALE CASTIONE DELLA PRESOLANA</h1>
      <div className="relative">
        🔔
        {count > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-xs text-white rounded-full px-2">{count}</span>}
      </div>
    </header>
  );
}