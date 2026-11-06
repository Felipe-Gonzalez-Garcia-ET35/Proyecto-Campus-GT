'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { BeepResponse } from '@/types';

interface Props {
  beepId: string;
  slotsTotal: number;
}

export default function BeepFeed({ beepId, slotsTotal }: Props) {
  const [responses, setResponses] = useState<BeepResponse[]>([]);

  const fetchResponses = useCallback(async () => {
    if (!beepId) return;
    const { data } = await supabase
      .from('beep_responses')
      .select('*, profile:profiles(*)')
      .eq('beep_id', beepId);

    if (data) setResponses(data as unknown as BeepResponse[]);
  }, [beepId]);

  useEffect(() => {
    fetchResponses();

    const channel = supabase
      .channel(`beep-${beepId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'beep_responses', filter: `beep_id=eq.${beepId}` },
        () => {
          fetchResponses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [beepId, fetchResponses]);

  const accepted = responses.filter((r) => r.status === 'accepted');
  const slotsLeft = slotsTotal - accepted.length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
        <span className="text-sm font-semibold text-zinc-300">Respuestas en Vivo</span>
        <span className="text-xs px-2 py-1 bg-violet-950 text-violet-300 border border-violet-800 rounded-full">
          Cupos restantes: {slotsLeft > 0 ? slotsLeft : 0}
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {responses.map((res) => (
          <div key={res.id} className="flex justify-between items-center text-sm p-2 bg-zinc-800/50 rounded-lg">
            <span className="text-white">{res.profile?.username || 'Usuario'}</span>
            <span className={res.status === 'accepted' ? 'text-emerald-400' : 'text-rose-400'}>
              {res.status === 'accepted' ? '✓ Aceptó' : '✕ Rechazó'}
            </span>
          </div>
        ))}
        {responses.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-2">Esperando respuestas de tu Squad...</p>
        )}
      </div>
    </div>
  );
}
