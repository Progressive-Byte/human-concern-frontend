import { useEffect, useRef, useState } from "react";
import { getUserScheduleById } from "@/services/donationService";

export function useScheduleDetail(scheduleId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const refreshRef = useRef(null);

  useEffect(() => {
    if (!scheduleId) return;
    let alive = true;
    const refresh = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getUserScheduleById(scheduleId);
        if (!alive) return;
        setData(res?.data?.data || res?.data || null);
      } catch (e) {
        if (!alive) return;
        setData(null);
        setError(e?.message || "Failed to load schedule.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };
    refreshRef.current = refresh;
    refresh();
    return () => { alive = false; };
  }, [scheduleId]);

  return { loading, error, data, refreshRef };
}
