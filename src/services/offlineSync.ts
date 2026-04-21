import { replayOfflineOperation } from "@/api/pop";
import { isApiNetworkError } from "@/api/client";
import { useOfflineStore } from "@/store/offlineStore";

export async function syncOfflineQueue() {
  const store = useOfflineStore.getState();
  if (!store.hydrated || !store.online || store.syncing || !store.queue.length) return;

  store.setSyncing(true);
  try {
    while (useOfflineStore.getState().online) {
      const operation = useOfflineStore.getState().queue[0];
      if (!operation) return;

      try {
        await replayOfflineOperation(operation);
        await useOfflineStore.getState().removeOperation(operation.id);
      } catch (error) {
        if (isApiNetworkError(error)) {
          useOfflineStore.getState().setOnline(false);
          return;
        }
        await useOfflineStore.getState().removeOperation(operation.id);
      }
    }
  } finally {
    useOfflineStore.getState().setSyncing(false);
  }
}
