'use client';

import { useState } from 'react';
import { BeepType } from '@/types';

interface Props {
  groupId: string;
  senderId: string;
  onBeepCreated?: (beepId: string) => void;
}

export default function BeepTrigger({ groupId, senderId, onBeepCreated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [beepType, setBeepType] = useState<BeepType>('sonoro');
  const [slotsTotal, setSlotsTotal] = useState(4);
  const [loading, setLoading] = useState(false);

  const handleLaunch = async () => {
    if (!gameTitle.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/beeps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: senderId,
          group_id: groupId,
          game_title: gameTitle,
          beep_type: beepType,
          slots_total: slotsTotal
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsOpen(false);
        setGameTitle('');
        if (onBeepCreated && data.beep) {
          onBeepCreated(data.beep.id);
        }
      }
    } catch (err) {
      console.error('Error al lanzar el beep:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-violet-900/40 transition-all active:scale-95"
      >
        📣 LANZAR BEEP
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-violet-400">Armar Partida Instantánea</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div>
              <label className="text-xs text-zinc-400">Juego</label>
              <input
                type="text"
                placeholder="Ej. Valorant, CS2, League of Legends"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                className="w-full mt-1 p-3 bg-zinc-800 rounded-xl border border-zinc-700 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-zinc-400">Tipo de Beep</label>
                <select
                  value={beepType}
                  onChange={(e) => setBeepType(e.target.value as BeepType)}
                  className="w-full mt-1 p-3 bg-zinc-800 rounded-xl border border-zinc-700 text-white"
                >
                  <option value="sonoro">🔊 Sonoro</option>
                  <option value="silencioso">🔕 Silencioso</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-400">Cupos</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={slotsTotal}
                  onChange={(e) => setSlotsTotal(Number(e.target.value))}
                  className="w-full mt-1 p-3 bg-zinc-800 rounded-xl border border-zinc-700 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleLaunch}
              disabled={loading || !gameTitle.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all"
            >
              {loading ? 'Enviando...' : 'Lanzar Ahora'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
