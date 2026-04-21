import { PopAnsweredQuestion, PopLocation, PopQuestion, PopQuestionDetail, PopUser, QuestionStats } from "@/domain/schemas";
import { normalizeTimestamp } from "@/utils/time";

type BackendRole = {
  code?: string;
};

type BackendInterest = {
  interet?: {
    code?: string;
    libelle?: string;
  };
  priorite?: number;
};

type BackendGeoChoice = {
  pays?: {
    code?: string;
    libelle?: string;
  };
  dept?: {
    code?: string;
    libelle?: string;
  };
  ville?: {
    code?: string;
    libelle?: string;
  };
};

type BackendLanguage = {
  langue?: {
    code?: string;
    libelle?: string;
  };
};

export type BackendUser = {
  id: number;
  login: string;
  nom?: string;
  prenom?: string;
  email?: string;
  role?: BackendRole;
  interets?: BackendInterest[];
  choixGeo?: BackendGeoChoice[];
  parametres?: {
    langues?: BackendLanguage[];
  };
};

export type BackendQuestion = {
  id: number;
  code?: string;
  libelle?: string;
  description?: string;
  forwards?: number;
  dateCreation?: string | number;
  dateModification?: string | number;
  dateExpiration?: string | number;
  user?: BackendUser;
  statut?: {
    idStatut?: number;
    code?: string;
    libelle?: string;
  };
  choixGeo?: BackendGeoChoice[];
};

export type BackendStat = {
  idStat: number;
  dateCreation?: string | number;
  dateModification?: string | number;
  question?: BackendQuestion;
  reponse?: {
    id?: number;
    code?: string;
    libelle?: string;
  };
  user?: BackendUser;
};

export type BackendQuestionComment = {
  id: number;
  contenu?: string;
  user?: BackendUser;
  parentComment?: BackendQuestionComment;
  dateCreation?: string | number;
  dateModification?: string | number;
};

export type BackendQuestionMeeting = {
  id: number;
  typeMeeting?: "VIRTUEL" | "PHYSIQUE" | string;
  titre?: string;
  description?: string;
  lieu?: string;
  url?: string;
  user?: BackendUser;
  dateDebut?: string | number;
  dateFin?: string | number;
  dateCreation?: string | number;
  dateModification?: string | number;
};

export type BackendBudgetImpact = {
  id: number;
  sens?: "POSITIF" | "NEGATIF" | string;
  libelle?: string;
  description?: string;
  seuilPourcentage?: number | string;
};

export type BackendBudgetPoste = {
  id: number;
  code?: string;
  libelle?: string;
  description?: string;
  montantActuel?: number | string;
  impacts?: BackendBudgetImpact[];
};

export type BackendBudget = {
  id: number;
  niveau?: string;
  codeTerritoire?: string;
  libelleTerritoire?: string;
  annee?: number;
  montantTotal?: number | string;
  postes?: BackendBudgetPoste[];
  dateCreation?: string | number;
  dateModification?: string | number;
};

export type BackendBudgetAllocation = {
  id?: number;
  poste?: BackendBudgetPoste;
  montant?: number | string;
};

export type BackendBudgetChoice = {
  id?: number;
  budget?: BackendBudget;
  allocations?: BackendBudgetAllocation[];
  dateCreation?: string | number;
  dateModification?: string | number;
};

export type BackendBudgetChoiceResult = {
  choix?: BackendBudgetChoice;
  impacts?: BackendBudgetImpact[];
};

export type BackendActualite = {
  id: number;
  source?: string;
  titre?: string;
  resume?: string;
  url?: string;
  datePublication?: string | number;
  dateCreation?: string | number;
};

export type BackendQuestionSuggestion = {
  id: number;
  actualite?: BackendActualite;
  question?: BackendQuestion;
  statut?: string;
  titre?: string;
  description?: string;
  dateCreation?: string | number;
  dateModification?: string | number;
};

export type BackendLoi = {
  id: number;
  code?: string;
  titre?: string;
  contenu?: string;
  source?: string;
  datePublication?: string | number;
  dateCreation?: string | number;
  dateModification?: string | number;
};

export type BackendLoiIncoherence = {
  id: number;
  loi?: BackendLoi;
  loiReference?: BackendLoi;
  description?: string;
  correctionProposee?: string;
  statut?: string;
  dateCreation?: string | number;
  dateModification?: string | number;
};

export type BackendPropositionLoi = {
  id: number;
  question?: BackendQuestion;
  user?: BackendUser;
  titre?: string;
  exposeMotifs?: string;
  dispositif?: string;
  analyseConformite?: string;
  statut?: string;
  dateCreation?: string | number;
  dateModification?: string | number;
};

export type BackendAnsweredQuestion = PopAnsweredQuestion & {
  summaryKey: string;
};

export type BackendPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export const backendInterests = [
  { code: "Ecologie", label: "Ecologie" },
  { code: "Education", label: "Education" },
  { code: "Sante", label: "Sante" },
  { code: "Agriculture", label: "Agriculture" },
  { code: "Economie", label: "Economie" },
  { code: "Fiscalite", label: "Fiscalite" },
  { code: "Droit travail", label: "Droit travail" },
  { code: "Budget", label: "Budget" },
  { code: "Culture", label: "Culture" },
  { code: "Vie politique", label: "Vie politique" }
];

export const backendLocations = [
  { id: "75056", code: "75056", label: "Paris", type: "CITY" as const },
  { id: "69123", code: "69123", label: "Lyon", type: "CITY" as const },
  { id: "13055", code: "13055", label: "Marseille", type: "CITY" as const },
  { id: "44109", code: "44109", label: "Nantes", type: "CITY" as const },
  { id: "33063", code: "33063", label: "Bordeaux", type: "CITY" as const },
  { id: "59350", code: "59350", label: "Lille", type: "CITY" as const },
  { id: "31555", code: "31555", label: "Toulouse", type: "CITY" as const },
  { id: "35238", code: "35238", label: "Rennes", type: "CITY" as const },
  { id: "67482", code: "67482", label: "Strasbourg", type: "CITY" as const },
  { id: "75", code: "75", label: "Paris", type: "DEPARTMENT" as const },
  { id: "69", code: "69", label: "Rhône", type: "DEPARTMENT" as const },
  { id: "13", code: "13", label: "Bouches-du-Rhône", type: "DEPARTMENT" as const },
  { id: "44", code: "44", label: "Loire-Atlantique", type: "DEPARTMENT" as const },
  { id: "33", code: "33", label: "Gironde", type: "DEPARTMENT" as const },
  { id: "59", code: "59", label: "Nord", type: "DEPARTMENT" as const },
  { id: "31", code: "31", label: "Haute-Garonne", type: "DEPARTMENT" as const },
  { id: "35", code: "35", label: "Ille-et-Vilaine", type: "DEPARTMENT" as const },
  { id: "67", code: "67", label: "Bas-Rhin", type: "DEPARTMENT" as const },
  { id: "11", code: "11", label: "Île-de-France", type: "REGION" as const },
  { id: "84", code: "84", label: "Auvergne-Rhône-Alpes", type: "REGION" as const },
  { id: "93", code: "93", label: "Provence-Alpes-Côte d'Azur", type: "REGION" as const },
  { id: "52", code: "52", label: "Pays de la Loire", type: "REGION" as const },
  { id: "75", code: "75", label: "Nouvelle-Aquitaine", type: "REGION" as const },
  { id: "32", code: "32", label: "Hauts-de-France", type: "REGION" as const },
  { id: "76", code: "76", label: "Occitanie", type: "REGION" as const },
  { id: "53", code: "53", label: "Bretagne", type: "REGION" as const },
  { id: "44", code: "44", label: "Grand Est", type: "REGION" as const },
  { id: "FR", code: "FR", label: "France", type: "COUNTRY" as const }
];

export function backendPageContent<T>(page: BackendPage<T>) {
  return page.content;
}

const statusMap: Record<string, PopQuestion["status"]> = {
  BROUILLON: "DRAFT",
  ACTIF: "ACTIVE",
  INACTIF: "IDLE"
};

export const backendStatusId: Record<"ACTIVE" | "DRAFT" | "IDLE", number> = {
  DRAFT: 1,
  ACTIVE: 2,
  IDLE: 3
};

export const backendAnswerId: Record<"YES" | "NO" | "NEUTRAL", number> = {
  YES: 1,
  NO: 2,
  NEUTRAL: 3
};

const answerCodeMap: Record<string, keyof QuestionStats> = {
  OUI: "yes",
  NON: "no",
  NEUTRE: "neutral"
};

function mapBackendGeoChoices(choices: BackendGeoChoice[] | undefined): PopLocation[] {
  const locations: PopLocation[] = [];
  const seen = new Set<string>();
  for (const choice of choices ?? []) {
    const candidates: PopLocation[] = [
      choice.ville ? { id: choice.ville.code || "", label: choice.ville.libelle || choice.ville.code || "", type: "CITY" } : null,
      choice.dept ? { id: choice.dept.code || "", label: choice.dept.libelle || choice.dept.code || "", type: "DEPARTMENT" } : null,
      choice.pays ? { id: choice.pays.code || "", label: choice.pays.libelle || choice.pays.code || "", type: "COUNTRY" } : null
    ].filter(Boolean) as PopLocation[];
    for (const location of candidates) {
      const key = `${location.type}:${location.id}`;
      if (location.id && !seen.has(key)) {
        seen.add(key);
        locations.push(location);
      }
    }
  }
  return locations;
}

export function mapBackendUser(user: BackendUser): PopUser {
  return {
    uid: String(user.id),
    name: [user.prenom, user.nom].filter(Boolean).join(" ") || user.login,
    email: user.email || "",
    language: user.parametres?.langues?.[0]?.langue?.code?.toLowerCase() || "fr",
    role: user.role?.code || "USER",
    userChoiceGeo: mapBackendGeoChoices(user.choixGeo),
    userInterest: (user.interets ?? []).map((interest) => ({
      code: interest.interet?.code || "",
      label: interest.interet?.libelle || interest.interet?.code || "",
      priority: interest.priorite ?? 0
    }))
  };
}

export function mapBackendQuestion(question: BackendQuestion): PopQuestion {
  return {
    id: question.id,
    questionTitle: question.libelle || question.code || "",
    questionDesc: question.description || "",
    creator: question.user?.login || "",
    status: statusMap[question.statut?.code || ""] || question.statut?.code || "",
    createdAt: normalizeTimestamp(question.dateCreation),
    updatedAt: normalizeTimestamp(question.dateModification)
  };
}

export function mapBackendQuestionDetail(question: BackendQuestion, stats: BackendStat[]): PopQuestionDetail {
  return {
    ...mapBackendQuestion(question),
    geoTags: mapBackendGeoChoices(question.choixGeo),
    interestTags: [],
    stats: statsForQuestion(question.id, stats)
  };
}

export function mapBackendAnsweredQuestion(stat: BackendStat): BackendAnsweredQuestion {
  return {
    ...mapBackendQuestion(stat.question || { id: 0 }),
    summaryKey: `answered-${stat.idStat}`,
    response: stat.reponse?.libelle || stat.reponse?.code || "",
    answeredAt: normalizeTimestamp(stat.dateCreation || stat.dateModification),
    updatedAt: normalizeTimestamp(stat.dateModification)
  };
}

export function statsForQuestion(questionId: number, stats: BackendStat[]): QuestionStats {
  return stats.reduce(
    (acc, stat) => {
      if (stat.question?.id !== questionId) return acc;
      const key = answerCodeMap[stat.reponse?.code || ""];
      if (key) acc[key] += 1;
      return acc;
    },
    { yes: 0, no: 0, neutral: 0 }
  );
}
