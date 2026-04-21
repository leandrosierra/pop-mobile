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
import { apiRequest, isLegacyApi, legacyApiRequest, legacyUserIdFromToken } from "./client";
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
    if (isLegacyApi) return Promise.resolve();

    return apiRequest<void>("/pop/user/geochoices", {
      method: "POST",
      token,
      body: JSON.stringify(locations.map(locationPayload))
    });
  },
  saveInterests(token: string, interests: PopInterest[]) {
    if (isLegacyApi) return Promise.resolve();

    return apiRequest<void>("/pop/user/interets", {
      method: "POST",
      token,
      body: JSON.stringify(interests.map(interestPayload))
    });
  },
  removeGeoLocation(token: string, location: PopLocation) {
    if (isLegacyApi) return Promise.resolve();

    return apiRequest<void>(`/pop/user/geochoices/${encodeURIComponent(location.id)}`, {
      method: "DELETE",
      token,
      query: { geoType: location.type }
    });
  },
  removeInterest(token: string, code: string) {
    if (isLegacyApi) return Promise.resolve();

    return apiRequest<void>(`/pop/user/interets/${encodeURIComponent(code)}`, {
      method: "DELETE",
      token
    });
  },
  saveQuestion(
    token: string,
    question: {
      questionTitle: string;
      questionDesc: string;
      geoTags: PopLocation[];
      interestTags: string[];
    }
  ) {
    if (isLegacyApi) {
      return legacyApiRequest<void>("/question/create", {
        method: "POST",
        body: JSON.stringify({
          user: { id: legacyUserIdFromToken(token) },
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
  },
  listQuestionFeed(token: string) {
    if (isLegacyApi) {
      return legacyApiRequest<LegacyQuestion[]>("/question/all").then((questions) =>
        questions.filter((question) => question.statut?.code === "ACTIF").map(mapLegacyQuestion)
      );
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
        legacyApiRequest<LegacyQuestion>(`/question/${id}`),
        legacyApiRequest<LegacyStat[]>("/stat/all")
      ]).then(([question, stats]) => mapLegacyQuestionDetail(question, stats));
    }

    return apiRequest(`/pop/questions/${id}`, {
      method: "GET",
      token,
      schema: popQuestionDetailSchema
    });
  },
  answerQuestion(token: string, id: number, responseType: "YES" | "NO" | "NEUTRAL", method: "POST" | "PUT") {
    if (isLegacyApi) {
      return legacyApiRequest<void>("/stat/create", {
        method: "POST",
        body: JSON.stringify({
          question: { id },
          reponse: { id: legacyAnswerId[responseType] },
          user: { id: legacyUserIdFromToken(token) }
        })
      });
    }

    return apiRequest<void>(`/pop/questions/${id}/answer`, {
      method,
      token,
      body: JSON.stringify({ responseType })
    });
  },
  userAuthoredQuestions(token: string) {
    if (isLegacyApi) {
      return legacyApiRequest<LegacyQuestion[]>(`/question/user/${legacyUserIdFromToken(token)}`, {
        method: "POST"
      }).then((questions) => questions.map(mapLegacyQuestion));
    }

    return apiRequest("/pop/user/questions", {
      method: "GET",
      token,
      schema: questionListSchema
    });
  },
  userAnsweredQuestions(token: string) {
    if (isLegacyApi) {
      return legacyApiRequest<LegacyStat[]>("/stat/all").then((stats) =>
        stats.filter((stat) => stat.user?.id === legacyUserIdFromToken(token)).map(mapLegacyAnsweredQuestion)
      );
    }

    return apiRequest("/pop/user/answers", {
      method: "GET",
      token,
      schema: answeredQuestionListSchema
    });
  },
  changePassword(token: string, password: string) {
    if (isLegacyApi) return Promise.resolve();

    return apiRequest<void>("/pop/user/password", {
      method: "PUT",
      token,
      body: JSON.stringify({ password })
    });
  },
  adminQuestions(token: string) {
    if (isLegacyApi) {
      return legacyApiRequest<LegacyQuestion[]>("/question/all").then((questions) => ({
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
    if (isLegacyApi) {
      return legacyApiRequest<LegacyQuestion>(`/question/${id}`).then((question) =>
        legacyApiRequest<void>("/question/update", {
          method: "PUT",
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
  },
  parseInterest(input: unknown) {
    return popInterestSchema.parse(input);
  }
};
