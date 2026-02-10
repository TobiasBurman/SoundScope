import { useEffect, useState } from "react";
import { getUserReferences } from "../services/referenceServices";
import type { SavedReference } from "../types";

export function useUserReferences(userId?: string) {
  const [references, setReferences] = useState<SavedReference[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const data = await getUserReferences(userId);
    setReferences(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userId]);

  return { references, loading, reload: load };
}
