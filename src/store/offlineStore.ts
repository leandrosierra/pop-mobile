import { create } from "zustand";
import { PopInterest, PopLocation } from "@/domain/schemas";
import { SupportedLanguageCode } from "@/localization/languages";
import { offlineQueueStorage } from "@/utils/offlineQueueStorage";

type AnswerPayload = {
  id: number;
  responseType: "YES" | "NO" | "NEUTRAL";
  method: "POST" | "PUT";
};

type SaveQuestionPayload = {
  questionTitle: string;
  questionDesc: string;
  geoTags: PopLocation[];
  interestTags: string[];
};

type AdminStatusPayload = {
  id: number;
  status: "ACTIVE" | "DRAFT" | "IDLE";
};

export type OfflineOperation =
  | {
      id: string;
      createdAt: string;
      type: "SAVE_GEO_LOCATIONS";
      token: string;
      payload: { locations: PopLocation[] };
    }
  | {
      id: string;
      createdAt: string;
      type: "SAVE_INTERESTS";
      token: string;
      payload: { interests: PopInterest[] };
    }
  | {
      id: string;
      createdAt: string;
      type: "REMOVE_GEO_LOCATION";
      token: string;
      payload: { location: PopLocation };
    }
  | {
      id: string;
      createdAt: string;
      type: "REMOVE_INTEREST";
      token: string;
      payload: { code: string };
    }
  | {
      id: string;
      createdAt: string;
      type: "SAVE_QUESTION";
      token: string;
      payload: { question: SaveQuestionPayload };
    }
  | {
      id: string;
      createdAt: string;
      type: "ANSWER_QUESTION";
      token: string;
      payload: AnswerPayload;
    }
  | {
      id: string;
      createdAt: string;
      type: "SET_QUESTION_STATUS";
      token: string;
      payload: AdminStatusPayload;
    }
  | {
      id: string;
      createdAt: string;
      type: "SET_LANGUAGE";
      token: string;
      payload: { language: SupportedLanguageCode };
    };

export type OfflineOperationInput = Omit<OfflineOperation, "id" | "createdAt">;

type OfflineState = {
  hydrated: boolean;
  online: boolean;
  syncing: boolean;
  queue: OfflineOperation[];
  hydrate: () => Promise<void>;
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  enqueueOperation: (operation: OfflineOperationInput) => Promise<OfflineOperation>;
  removeOperation: (id: string) => Promise<void>;
  clearQueue: () => Promise<void>;
};

let hydrationPromise: Promise<void> | null = null;

const createOperationId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const readBrowserOnline = () => (typeof navigator === "undefined" || !("onLine" in navigator) ? true : navigator.onLine);

export const useOfflineStore = create<OfflineState>((set, get) => ({
  hydrated: false,
  online: readBrowserOnline(),
  syncing: false,
  queue: [],
  hydrate() {
    if (get().hydrated) return Promise.resolve();
    if (hydrationPromise) return hydrationPromise;

    hydrationPromise = offlineQueueStorage.read<OfflineOperation>().then((queue) => {
      set({ hydrated: true, online: readBrowserOnline(), queue });
    }).finally(() => {
      hydrationPromise = null;
    });

    return hydrationPromise;
  },
  setOnline(online) {
    if (get().online !== online) set({ online });
  },
  setSyncing(syncing) {
    if (get().syncing !== syncing) set({ syncing });
  },
  async enqueueOperation(input) {
    const operation = {
      ...input,
      id: createOperationId(),
      createdAt: new Date().toISOString()
    } as OfflineOperation;
    const queue = [...get().queue, operation];
    set({ queue });
    await offlineQueueStorage.write(queue);
    return operation;
  },
  async removeOperation(id) {
    const queue = get().queue.filter((operation) => operation.id !== id);
    set({ queue });
    await offlineQueueStorage.write(queue);
  },
  async clearQueue() {
    set({ queue: [] });
    await offlineQueueStorage.clear();
  }
}));
