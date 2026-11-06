import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:soporte@beepgamer.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sender_id, group_id, game_title, beep_type, slots_total } = body;

    const { data: beep, error } = await supabase
      .from('beeps')
      .insert([{ sender_id, group_id, game_title, beep_type, slots_total }])
      .select()
      .single();

    if (error) throw error;

    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', group_id)
      .neq('user_id', sender_id);

    const userIds = members?.map((m) => m.user_id) || [];

    if (userIds.length > 0) {
      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('subscription_json')
        .in('user_id', userIds);

      const payload = JSON.stringify({
        title: `¡Beep de ${game_title}!`,
        body: `Cupos disponibles: ${slots_total}. ¡Unite a la partida!`,
        beep_type,
        url: `/`
      });

      const pushPromises = (subs || []).map((sub) =>
        webpush.sendNotification(sub.subscription_json, payload).catch((err) => {
          console.error('Error enviando push:', err);
        })
      );

      await Promise.all(pushPromises);
    }

    return NextResponse.json({ success: true, beep }, { status: 201 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error interno del servidor';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
