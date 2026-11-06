'use client';

import { useState } from 'react';
import { Profile } from '@/types';

interface Props {
  contacts: Profile[];
  onRemoveContact: (id: string) => void;
}

export default function ContactFilter({ contacts, onRemoveContact }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.favorite_games.some((g) => g.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar por amigo o juego..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm text-white focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2.5 bg-zinc-800 rounded-xl border border-zinc-700 text-sm text-white"
        >
          <option value="all">Todos</option>
          <option value="disponible">🟢 Disponible</option>
          <option value="ocupado">🔴 Ocupado</option>
          <option value="offline">⚪ Offline</option>
        </select>
      </div>

      <div className="divide-y divide-zinc-800">
        {filtered.map((contact) => (
          <div key={contact.id} className="flex justify-between items-center py-3">
            <div>
              <p className="text-sm font-medium text-white">{contact.username}</p>
              <p className="text-xs text-zinc-400">
                {contact.favorite_games.join(', ') || 'Sin juegos cargados'}
              </p>
            </div>
            <button
              onClick={() => onRemoveContact(contact.id)}
              className="text-xs text-rose-500 hover:text-rose-400 px-2 py-1 rounded bg-rose-950/30 border border-rose-900"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
