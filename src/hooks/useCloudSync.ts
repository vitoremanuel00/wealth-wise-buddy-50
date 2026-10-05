/**
 * Syncs the local Zustand store with the user's row in Lovable Cloud.
 * - On login: loads the cloud snapshot; if none exists, uploads local data (import).
 * - After that: every store change is saved (debounced).
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/services/store";
import type { Json } from "@/integrations/supabase/types";

function snapshot() {
  const s = useStore.getState() as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) if (typeof v !== "function") out[k] = v;
  return out;
}

export function useCloudSync(userId: string) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let unsub: (() => void) | undefined;

    const save = async () => {
      const { error } = await supabase
        .from("finance_states")
        .upsert({ user_id: userId, data: snapshot() as Json, updated_at: new Date().toISOString() });
      if (error) console.error("Falha ao salvar na nuvem", error);
    };

    (async () => {
      const { data, error } = await supabase
        .from("finance_states")
        .select("data")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error(error);
      } else if (data?.data && typeof data.data === "object" && Object.keys(data.data).length) {
        useStore.setState(data.data as never);
      } else {
        await save(); // first login: import local data
      }
      if (cancelled) return;
      setReady(true);
      unsub = useStore.subscribe(() => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(save, 800);
      });
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      unsub?.();
    };
  }, [userId]);

  return ready;
}
