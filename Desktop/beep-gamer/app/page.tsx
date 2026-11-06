'use client';

import { useState, useEffect } from 'react';
import BeepTrigger from '@/components/beep/BeepTrigger';
import BeepFeed from '@/components/beep/BeepFeed';
import ContactFilter from '@/components/groups/ContactFilter';
import { Profile } from '@/types';
import { subscribeUserToPush } from '@/lib/notifications';

const MOCK_CONTACTS: Profile[] = [
  { id: '1', username: 'GamerPro99', status: 'disponible', favorite_games: ['Valorant', 'CS2'] },
  { id: '2', username: 'ShadowNinja', status: 'ocupado', favorite_games: ['League of Legends'] },
  { id: '3', username: 'SlayerX', status: 'offline', favorite_games: ['CS2', 'Dota 2'] },
];

export default function HomePage() {
  const [activeBeepId, setActiveBeepId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Profile[]>(MOCK_CONTACTS);

  useEffect(() => {
    subscribeUserToPush().catch((err) => {
      console.warn('Las notificaciones no se han activado:', err.message);
    });
  }, []);

  const handleRemoveContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-6">
      <header className="text-center py-4 border-b border-zinc-800">
        <h1 className="text-2xl font-black text-violet-500 tracking-wider">BEEP GAMER</h1>
        <p className="text-xs text-zinc-400">Armá partidas con tu Squad en segundos</p>
      </header>

      <section>
        <BeepTrigger
          groupId="group-123"
          senderId="user-456"
          onBeepCreated={(id) => setActiveBeepId(id)}
        />
      </section>

      {activeBeepId && (
        <section>
          <BeepFeed beepId={activeBeepId} slotsTotal={4} />
        </section>
      )}

      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <h2 className="text-sm font-bold text-zinc-300 mb-3">Mi Squad</h2>
        <ContactFilter contacts={contacts} onRemoveContact={handleRemoveContact} />
      </section>
    </main>
  );
}
