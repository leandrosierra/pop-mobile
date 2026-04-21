import { PopInterest, PopLocation, popInterestSchema } from "@/domain/schemas";
import { OfflineOperation, OfflineOperationInput, useOfflineStore } from "@/store/offlineStore";
import { apiRequest, isApiNetworkError } from "./client";
import { authApi } from "./auth";
import {
  backendAnswerId,
  BackendActualite,
  BackendBudget,
  BackendBudgetChoiceResult,
  BackendLoiIncoherence,
  BackendPropositionLoi,
  BackendQuestionComment,
  BackendQuestionMeeting,
  BackendQuestionSuggestion,
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

type CreateMeetingInput = {
  typeMeeting: "VIRTUEL" | "PHYSIQUE";
  titre: string;
  description: string;
  lieu: string;
  url: string;
  dateDebut: string;
  dateFin: string;
};

type BudgetAllocationInput = {
  posteId: number;
  montant: number;
};

type LawProposalInput = {
  titre: string;
  exposeMotifs: string;
  dispositif: string;
  analyseConformite: string;
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
  questionCommentsPage(token: string, id: number, page = 0) {
    return apiRequest<BackendPage<BackendQuestionComment>>(`/discussion/question/${id}/comments`, { token, query: { page, size: 10 } });
  },
  questionComments(token: string, id: number) {
    return popApi.questionCommentsPage(token, id)
      .then(backendPageContent);
  },
  createQuestionComment(token: string, id: number, contenu: string, parentCommentId?: number) {
    return apiRequest<BackendQuestionComment>(`/discussion/question/${id}/comment/create`, {
      method: "POST",
      token,
      body: JSON.stringify({
        contenu,
        parentComment: parentCommentId ? { id: parentCommentId } : null
      })
    });
  },
  questionMeetingsPage(token: string, id: number, page = 0) {
    return apiRequest<BackendPage<BackendQuestionMeeting>>(`/discussion/question/${id}/meetings`, { token, query: { page, size: 10 } });
  },
  questionMeetings(token: string, id: number) {
    return popApi.questionMeetingsPage(token, id)
      .then(backendPageContent);
  },
  createQuestionMeeting(token: string, id: number, meeting: CreateMeetingInput) {
    return apiRequest<BackendQuestionMeeting>(`/discussion/question/${id}/meeting/create`, {
      method: "POST",
      token,
      body: JSON.stringify(meeting)
    });
  },
  budgetsForTerritoryPage(token: string, niveau: string, code: string, page = 0) {
    return apiRequest<BackendPage<BackendBudget>>(`/budget/territoire/${niveau}/${code}`, { token, query: { page, size: 10 } });
  },
  budgetsForTerritory(token: string, niveau: string, code: string) {
    return popApi.budgetsForTerritoryPage(token, niveau, code)
      .then(backendPageContent);
  },
  saveBudgetChoice(token: string, budgetId: number, allocations: BudgetAllocationInput[]) {
    return apiRequest<BackendBudgetChoiceResult>("/budget/choix/create", {
      method: "POST",
      token,
      body: JSON.stringify({
        budget: { id: budgetId },
        allocations: allocations.map((allocation) => ({
          poste: { id: allocation.posteId },
          montant: allocation.montant
        }))
      })
    });
  },
  actualitesPage(token: string, page = 0) {
    return apiRequest<BackendPage<BackendActualite>>("/actualite/all", { token, query: { page, size: 10 } });
  },
  actualites(token: string) {
    return popApi.actualitesPage(token)
      .then(backendPageContent);
  },
  questionSuggestionsPage(token: string, page = 0) {
    return apiRequest<BackendPage<BackendQuestionSuggestion>>("/actualite/suggestions", { token, query: { page, size: 10 } });
  },
  questionSuggestions(token: string) {
    return popApi.questionSuggestionsPage(token)
      .then(backendPageContent);
  },
  lawIncoherencesPage(token: string, page = 0) {
    return apiRequest<BackendPage<BackendLoiIncoherence>>("/loi/incoherence/all", { token, query: { page, size: 10 } });
  },
  lawIncoherences(token: string) {
    return popApi.lawIncoherencesPage(token)
      .then(backendPageContent);
  },
  questionLawProposalsPage(token: string, id: number, page = 0) {
    return apiRequest<BackendPage<BackendPropositionLoi>>(`/loi/proposition/question/${id}`, { token, query: { page, size: 10 } });
  },
  questionLawProposals(token: string, id: number) {
    return popApi.questionLawProposalsPage(token, id)
      .then(backendPageContent);
  },
  currentUserLawProposalsPage(token: string, page = 0) {
    return apiRequest<BackendPage<BackendPropositionLoi>>("/loi/proposition/user/current", { token, query: { page, size: 10 } });
  },
  currentUserLawProposals(token: string) {
    return popApi.currentUserLawProposalsPage(token)
      .then(backendPageContent);
  },
  createLawProposal(token: string, questionId: number, proposal: LawProposalInput) {
    return apiRequest<BackendPropositionLoi>("/loi/proposition/create", {
      method: "POST",
      token,
      body: JSON.stringify({
        question: { id: questionId },
        ...proposal,
        statut: "BROUILLON"
      })
    });
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
