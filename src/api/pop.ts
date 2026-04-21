import { z } from "zod";
import {
  interestListResponseSchema,
  PopInterest,
  PopLocation,
  popAnsweredQuestionSchema,
  popInterestSchema,
  popLocationSchema,
  popQuestionDetailSchema,
  popQuestionSchema
} from "@/domain/schemas";
import { OfflineOperation, OfflineOperationInput, useOfflineStore } from "@/store/offlineStore";
import { apiRequest, isApiNetworkError, isLegacyApi, legacyApiRequest } from "./client";
import { authApi } from "./auth";
import {
  legacyAnswerId,
  legacyInterests,
  legacyLocations,
  legacyStatusId,
  LegacyQuestion,
  LegacyStat,
  mapLegacyAnsweredQuestion,
  mapLegacyQuestion,
  mapLegacyQuestionDetail
} from "./legacy";

const questionListSchema = z.array(popQuestionSchema);
const answeredQuestionListSchema = z.array(popAnsweredQuestionSchema);
const adminQuestionMapSchema = z.record(z.string(), z.array(popQuestionSchema));

const locationPayload = (location: PopLocation) => ({
  code: location.id,
  libelle: location.label,
  type: location.type
});

const interestPayload = (interest: PopInterest) => ({
  code: interest.code,
  libelle: interest.label
});

export type OfflineMutationResult = {
  queued: boolean;
};

type SaveQuestionInput = {
  questionTitle: string;
  questionDesc: string;
  geoTags: PopLocation[];
  interestTags: string[];
};

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

const saveGeoLocationsOnline = (token: string, locations: PopLocation[]) => {
  if (isLegacyApi) return Promise.resolve();

  return apiRequest<void>("/pop/user/geochoices", {
    method: "POST",
    token,
    body: JSON.stringify(locations.map(locationPayload))
  });
};

const saveInterestsOnline = (token: string, interests: PopInterest[]) => {
  if (isLegacyApi) return Promise.resolve();

  return apiRequest<void>("/pop/user/interets", {
    method: "POST",
    token,
    body: JSON.stringify(interests.map(interestPayload))
  });
};

const removeGeoLocationOnline = (token: string, location: PopLocation) => {
  if (isLegacyApi) return Promise.resolve();

  return apiRequest<void>(`/pop/user/geochoices/${encodeURIComponent(location.id)}`, {
    method: "DELETE",
    token,
    query: { geoType: location.type }
  });
};

const removeInterestOnline = (token: string, code: string) => {
  if (isLegacyApi) return Promise.resolve();

  return apiRequest<void>(`/pop/user/interets/${encodeURIComponent(code)}`, {
    method: "DELETE",
    token
  });
};

const saveQuestionOnline = (token: string, question: SaveQuestionInput) => {
  if (isLegacyApi) {
    return legacyApiRequest<void>("/question/create", {
      method: "POST",
      token,
      body: JSON.stringify({
        statut: { idStatut: legacyStatusId.DRAFT },
        code: `Q-${Date.now()}`,
        libelle: question.questionTitle,
        description: question.questionDesc,
        forwards: 0
      })
    });
  }

  return apiRequest<void>("/pop/questions", {
    method: "POST",
    token,
    body: JSON.stringify({
      ...question,
      geoTags: question.geoTags.map(locationPayload)
    })
  });
};

const answerQuestionOnline = (
  token: string,
  id: number,
  responseType: "YES" | "NO" | "NEUTRAL",
  method: "POST" | "PUT"
) => {
  if (isLegacyApi) {
    return legacyApiRequest<void>("/stat/create", {
      method: "POST",
      token,
      body: JSON.stringify({
        question: { id },
        reponse: { id: legacyAnswerId[responseType] }
      })
    });
  }

  return apiRequest<void>(`/pop/questions/${id}/answer`, {
    method,
    token,
    body: JSON.stringify({ responseType })
  });
};

const changePasswordOnline = (token: string, password: string) => {
  if (isLegacyApi) {
    return legacyApiRequest<void>("/user/current/password", {
      method: "PUT",
      token,
      body: JSON.stringify({ password })
    });
  }

  return apiRequest<void>("/pop/user/password", {
    method: "PUT",
    token,
    body: JSON.stringify({ password })
  });
};

const setQuestionStatusOnline = (token: string, id: number, status: "ACTIVE" | "DRAFT" | "IDLE") => {
  if (isLegacyApi) {
    return legacyApiRequest<LegacyQuestion>(`/question/${id}`, { token }).then((question) =>
      legacyApiRequest<void>("/question/update", {
        method: "PUT",
        token,
        body: JSON.stringify({
          id: question.id,
          libelle: question.libelle,
          description: question.description,
          forwards: question.forwards ?? 0,
          image: null,
          statut: { idStatut: legacyStatusId[status] }
        })
      })
    );
  }

  return apiRequest<void>(`/pop/questions/${id}/status`, {
    method: "PUT",
    token,
    body: JSON.stringify({ status })
  });
};

export function replayOfflineOperation(operation: OfflineOperation) {
  switch (operation.type) {
    case "SAVE_GEO_LOCATIONS":
      return saveGeoLocationsOnline(operation.token, operation.payload.locations);
    case "SAVE_INTERESTS":
      return saveInterestsOnline(operation.token, operation.payload.interests);
    case "REMOVE_GEO_LOCATION":
      return removeGeoLocationOnline(operation.token, operation.payload.location);
    case "REMOVE_INTEREST":
      return removeInterestOnline(operation.token, operation.payload.code);
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
  async getInterests() {
    if (isLegacyApi) return legacyInterests;

    const data = await apiRequest("/pop/referential/interests", {
      method: "GET",
      schema: interestListResponseSchema
    });
    return data.interestList;
  },
  async searchLocations(searchText: string, pageNumber = 0) {
    if (isLegacyApi) {
      const normalizedSearch = searchText.trim().toLocaleLowerCase();
      return legacyLocations.filter((location) => location.label.toLocaleLowerCase().includes(normalizedSearch));
    }

    const data = await apiRequest<{
      countries?: unknown[];
      regions?: unknown[];
      departments?: unknown[];
      cities?: unknown[];
      circonscriptions?: unknown[];
    }>("/pop/referential/geolocations", {
      method: "GET",
      query: { searchText, pageNumber }
    });

    return [
      ...(data.countries ?? []).map((item) => popLocationSchema.parse({ ...(item as object), type: "COUNTRY" })),
      ...(data.regions ?? []).map((item) => popLocationSchema.parse({ ...(item as object), type: "REGION" })),
      ...(data.departments ?? []).map((item) => popLocationSchema.parse({ ...(item as object), type: "DEPARTMENT" })),
      ...(data.cities ?? []).map((item) => popLocationSchema.parse({ ...(item as object), type: "CITY" })),
      ...(data.circonscriptions ?? []).map((item) => popLocationSchema.parse({ ...(item as object), type: "CIRCONSCRIPTION" }))
    ];
  },
  saveGeoLocations(token: string, locations: PopLocation[]) {
    return offlineMutation(
      { type: "SAVE_GEO_LOCATIONS", token, payload: { locations } },
      () => saveGeoLocationsOnline(token, locations)
    );
  },
  saveInterests(token: string, interests: PopInterest[]) {
    return offlineMutation(
      { type: "SAVE_INTERESTS", token, payload: { interests } },
      () => saveInterestsOnline(token, interests)
    );
  },
  removeGeoLocation(token: string, location: PopLocation) {
    return offlineMutation(
      { type: "REMOVE_GEO_LOCATION", token, payload: { location } },
      () => removeGeoLocationOnline(token, location)
    );
  },
  removeInterest(token: string, code: string) {
    return offlineMutation(
      { type: "REMOVE_INTEREST", token, payload: { code } },
      () => removeInterestOnline(token, code)
    );
  },
  saveQuestion(token: string, question: SaveQuestionInput) {
    return offlineMutation(
      { type: "SAVE_QUESTION", token, payload: { question } },
      () => saveQuestionOnline(token, question)
    );
  },
  listQuestionFeed(token: string) {
    if (isLegacyApi) {
      return legacyApiRequest<LegacyQuestion[]>("/question/feed", { token }).then((questions) => questions.map(mapLegacyQuestion));
    }

    return apiRequest("/pop/user/question-feed", {
      method: "GET",
      token,
      schema: questionListSchema
    });
  },
  getQuestion(token: string, id: number) {
    if (isLegacyApi) {
      return Promise.all([
        legacyApiRequest<LegacyQuestion>(`/question/${id}`, { token }),
        legacyApiRequest<LegacyStat[]>(`/stat/question/${id}`, { token })
      ]).then(([question, stats]) => mapLegacyQuestionDetail(question, stats));
    }

    return apiRequest(`/pop/questions/${id}`, {
      method: "GET",
      token,
      schema: popQuestionDetailSchema
    });
  },
  answerQuestion(token: string, id: number, responseType: "YES" | "NO" | "NEUTRAL", method: "POST" | "PUT") {
    return offlineMutation(
      { type: "ANSWER_QUESTION", token, payload: { id, responseType, method } },
      () => answerQuestionOnline(token, id, responseType, method)
    );
  },
  userAuthoredQuestions(token: string) {
    if (isLegacyApi) {
      return legacyApiRequest<LegacyQuestion[]>("/question/user/current", { token }).then((questions) =>
        questions.map(mapLegacyQuestion)
      );
    }

    return apiRequest("/pop/user/questions", {
      method: "GET",
      token,
      schema: questionListSchema
    });
  },
  userAnsweredQuestions(token: string) {
    if (isLegacyApi) {
      return legacyApiRequest<LegacyStat[]>("/stat/user/current", { token }).then((stats) =>
        stats.map(mapLegacyAnsweredQuestion)
      );
    }

    return apiRequest("/pop/user/answers", {
      method: "GET",
      token,
      schema: answeredQuestionListSchema
    });
  },
  changePassword(token: string, password: string) {
    return changePasswordOnline(token, password);
  },
  adminQuestions(token: string) {
    if (isLegacyApi) {
      return legacyApiRequest<LegacyQuestion[]>("/question/all", { token }).then((questions) => ({
        DRAFT: questions.filter((question) => question.statut?.code === "BROUILLON").map(mapLegacyQuestion),
        ACTIVE: questions.filter((question) => question.statut?.code === "ACTIF").map(mapLegacyQuestion),
        IDLE: questions.filter((question) => question.statut?.code === "INACTIF").map(mapLegacyQuestion)
      }));
    }

    return apiRequest("/pop/questions", {
      method: "GET",
      token,
      schema: adminQuestionMapSchema
    });
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
