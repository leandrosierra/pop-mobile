import { PopInterest, PopLocation, popInterestSchema } from "@/domain/schemas";
import { OfflineOperation, OfflineOperationInput, useOfflineStore } from "@/store/offlineStore";
import { apiRequest, isApiNetworkError } from "./client";
import { authApi } from "./auth";
import {
  backendAnswerId,
  backendInterests,
  backendLocations,
  backendPageContent,
  backendStatusId,
  BackendPage,
  BackendQuestion,
  BackendStat,
  mapBackendAnsweredQuestion,
  mapBackendQuestion,
  mapBackendQuestionDetail
} from "./backend";

export type OfflineMutationResult = {
  queued: boolean;
};

type SaveQuestionInput = {
  questionTitle: string;
  questionDesc: string;
  geoTags: PopLocation[];
  interestTags: string[];
};

const completeOnline = () => Promise.resolve();

const offlineMutation = async (operation: OfflineOperationInput, run: () => Promise<void>): Promise<OfflineMutationResult> => {
  if (!useOfflineStore.getState().online) {
    await useOfflineStore.getState().enqueueOperation(operation);
    return { queued: true };
  }

  try {
    await run();
    return { queued: false };
  } catch (error) {
    if (isApiNetworkError(error)) {
      await useOfflineStore.getState().enqueueOperation(operation);
      return { queued: true };
    }
    throw error;
  }
};

const saveQuestionOnline = (token: string, question: SaveQuestionInput) =>
  apiRequest<void>("/question/create", {
    method: "POST",
    token,
    body: JSON.stringify({
      statut: { idStatut: backendStatusId.DRAFT },
      code: `Q-${Date.now()}`,
      libelle: question.questionTitle,
      description: question.questionDesc,
      forwards: 0
    })
  });

const answerQuestionOnline = (
  token: string,
  id: number,
  responseType: "YES" | "NO" | "NEUTRAL",
  _method: "POST" | "PUT"
) =>
  apiRequest<void>("/stat/create", {
    method: "POST",
    token,
    body: JSON.stringify({
      question: { id },
      reponse: { id: backendAnswerId[responseType] }
    })
  });

const changePasswordOnline = (token: string, password: string) =>
  apiRequest<void>("/user/current/password", {
    method: "PUT",
    token,
    body: JSON.stringify({ password })
  });

const setQuestionStatusOnline = (token: string, id: number, status: "ACTIVE" | "DRAFT" | "IDLE") =>
  apiRequest<BackendQuestion>(`/question/${id}`, { token }).then((question) =>
    apiRequest<void>("/question/update", {
      method: "PUT",
      token,
      body: JSON.stringify({
        id: question.id,
        libelle: question.libelle,
        description: question.description,
        forwards: question.forwards ?? 0,
        image: null,
        statut: { idStatut: backendStatusId[status] }
      })
    })
  );

export function replayOfflineOperation(operation: OfflineOperation) {
  switch (operation.type) {
    case "SAVE_GEO_LOCATIONS":
      return completeOnline();
    case "SAVE_INTERESTS":
      return completeOnline();
    case "REMOVE_GEO_LOCATION":
      return completeOnline();
    case "REMOVE_INTEREST":
      return completeOnline();
    case "SAVE_QUESTION":
      return saveQuestionOnline(operation.token, operation.payload.question);
    case "ANSWER_QUESTION":
      return answerQuestionOnline(operation.token, operation.payload.id, operation.payload.responseType, operation.payload.method);
    case "SET_QUESTION_STATUS":
      return setQuestionStatusOnline(operation.token, operation.payload.id, operation.payload.status);
    case "SET_LANGUAGE":
      return authApi.updateLanguage(operation.token, operation.payload.language).then(() => undefined);
  }
}

export const popApi = {
  getInterests() {
    return Promise.resolve(backendInterests);
  },
  searchLocations(searchText: string, _pageNumber = 0) {
    const normalizedSearch = searchText.trim().toLocaleLowerCase();
    return Promise.resolve(
      backendLocations.filter((location) => location.label.toLocaleLowerCase().includes(normalizedSearch))
    );
  },
  saveGeoLocations(token: string, locations: PopLocation[]) {
    return offlineMutation(
      { type: "SAVE_GEO_LOCATIONS", token, payload: { locations } },
      completeOnline
    );
  },
  saveInterests(token: string, interests: PopInterest[]) {
    return offlineMutation(
      { type: "SAVE_INTERESTS", token, payload: { interests } },
      completeOnline
    );
  },
  removeGeoLocation(token: string, location: PopLocation) {
    return offlineMutation(
      { type: "REMOVE_GEO_LOCATION", token, payload: { location } },
      completeOnline
    );
  },
  removeInterest(token: string, code: string) {
    return offlineMutation(
      { type: "REMOVE_INTEREST", token, payload: { code } },
      completeOnline
    );
  },
  saveQuestion(token: string, question: SaveQuestionInput) {
    return offlineMutation(
      { type: "SAVE_QUESTION", token, payload: { question } },
      () => saveQuestionOnline(token, question)
    );
  },
  listQuestionFeed(token: string) {
    return apiRequest<BackendPage<BackendQuestion>>("/question/feed", { token, query: { page: 0, size: 10 } })
      .then(backendPageContent)
      .then((questions) => questions.map(mapBackendQuestion));
  },
  getQuestion(token: string, id: number) {
    return Promise.all([
      apiRequest<BackendQuestion>(`/question/${id}`, { token }),
      apiRequest<BackendPage<BackendStat>>(`/stat/question/${id}`, { token, query: { page: 0, size: 10 } })
    ]).then(([question, stats]) => mapBackendQuestionDetail(question, backendPageContent(stats)));
  },
  answerQuestion(token: string, id: number, responseType: "YES" | "NO" | "NEUTRAL", method: "POST" | "PUT") {
    return offlineMutation(
      { type: "ANSWER_QUESTION", token, payload: { id, responseType, method } },
      () => answerQuestionOnline(token, id, responseType, method)
    );
  },
  userAuthoredQuestions(token: string) {
    return apiRequest<BackendPage<BackendQuestion>>("/question/user/current", { token, query: { page: 0, size: 10 } })
      .then(backendPageContent)
      .then((questions) => questions.map(mapBackendQuestion));
  },
  userAnsweredQuestions(token: string) {
    return apiRequest<BackendPage<BackendStat>>("/stat/user/current", { token, query: { page: 0, size: 10 } })
      .then(backendPageContent)
      .then((stats) => stats.map(mapBackendAnsweredQuestion));
  },
  changePassword(token: string, password: string) {
    return changePasswordOnline(token, password);
  },
  adminQuestions(token: string) {
    return apiRequest<BackendPage<BackendQuestion>>("/question/all", { token, query: { page: 0, size: 10 } })
      .then(backendPageContent)
      .then((questions) => ({
        DRAFT: questions.filter((question) => question.statut?.code === "BROUILLON").map(mapBackendQuestion),
        ACTIVE: questions.filter((question) => question.statut?.code === "ACTIF").map(mapBackendQuestion),
        IDLE: questions.filter((question) => question.statut?.code === "INACTIF").map(mapBackendQuestion)
      }));
  },
  setQuestionStatus(token: string, id: number, status: "ACTIVE" | "DRAFT" | "IDLE") {
    return offlineMutation(
      { type: "SET_QUESTION_STATUS", token, payload: { id, status } },
      () => setQuestionStatusOnline(token, id, status)
    );
  },
  parseInterest(input: unknown) {
    return popInterestSchema.parse(input);
  }
};
