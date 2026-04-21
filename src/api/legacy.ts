import { PopAnsweredQuestion, PopQuestion, PopQuestionDetail, PopUser, QuestionStats } from "@/domain/schemas";

type LegacyRole = {
  code?: string;
};

type LegacyInterest = {
  interet?: {
    code?: string;
    libelle?: string;
  };
  priorite?: number;
};

type LegacyGeoChoice = {
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

export type LegacyUser = {
  id: number;
  login: string;
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  role?: LegacyRole;
  interets?: LegacyInterest[];
  choixGeo?: LegacyGeoChoice[];
};

export type LegacyQuestion = {
  id: number;
  code?: string;
  libelle?: string;
  description?: string;
  forwards?: number;
  user?: LegacyUser;
  statut?: {
    idStatut?: number;
    code?: string;
    libelle?: string;
  };
  choixGeo?: LegacyGeoChoice[];
};

export type LegacyStat = {
  idStat: number;
  question?: LegacyQuestion;
  reponse?: {
    id?: number;
    code?: string;
    libelle?: string;
  };
  user?: LegacyUser;
};

export const legacyInterests = [
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

export const legacyLocations = [
  { id: "75056", code: "75056", label: "Paris", type: "CITY" as const },
  { id: "69123", code: "69123", label: "Lyon", type: "CITY" as const },
  { id: "13055", code: "13055", label: "Marseille", type: "CITY" as const },
  { id: "44109", code: "44109", label: "Nantes", type: "CITY" as const }
];

const statusMap: Record<string, PopQuestion["status"]> = {
  BROUILLON: "DRAFT",
  ACTIF: "ACTIVE",
  INACTIF: "IDLE"
};

export const legacyStatusId: Record<"ACTIVE" | "DRAFT" | "IDLE", number> = {
  DRAFT: 1,
  ACTIVE: 2,
  IDLE: 3
};

export const legacyAnswerId: Record<"YES" | "NO" | "NEUTRAL", number> = {
  YES: 1,
  NO: 2,
  NEUTRAL: 3
};

const answerCodeMap: Record<string, keyof QuestionStats> = {
  OUI: "yes",
  NON: "no",
  NEUTRE: "neutral"
};

export function mapLegacyUser(user: LegacyUser): PopUser {
  return {
    uid: String(user.id),
    name: [user.prenom, user.nom].filter(Boolean).join(" ") || user.login,
    email: user.email || "",
    role: user.role?.code || "USER",
    userChoiceGeo: (user.choixGeo ?? []).map((choice) => ({
      id: choice.ville?.code || choice.dept?.code || choice.pays?.code || "",
      label: choice.ville?.libelle || choice.dept?.libelle || choice.pays?.libelle || "",
      type: choice.ville ? "CITY" : choice.dept ? "DEPARTMENT" : "COUNTRY"
    })),
    userInterest: (user.interets ?? []).map((interest) => ({
      code: interest.interet?.code || "",
      label: interest.interet?.libelle || interest.interet?.code || "",
      priority: interest.priorite ?? 0
    }))
  };
}

export function mapLegacyQuestion(question: LegacyQuestion): PopQuestion {
  return {
    id: question.id,
    questionTitle: question.libelle || question.code || "",
    questionDesc: question.description || "",
    creator: question.user?.login || "",
    status: statusMap[question.statut?.code || ""] || question.statut?.code || ""
  };
}

export function mapLegacyQuestionDetail(question: LegacyQuestion, stats: LegacyStat[]): PopQuestionDetail {
  return {
    ...mapLegacyQuestion(question),
    geoTags: (question.choixGeo ?? []).map((choice) => ({
      id: choice.ville?.code || choice.dept?.code || choice.pays?.code || "",
      label: choice.ville?.libelle || choice.dept?.libelle || choice.pays?.libelle || "",
      type: choice.ville ? "CITY" : choice.dept ? "DEPARTMENT" : "COUNTRY"
    })),
    interestTags: [],
    stats: statsForQuestion(question.id, stats)
  };
}

export function mapLegacyAnsweredQuestion(stat: LegacyStat): PopAnsweredQuestion {
  return {
    ...mapLegacyQuestion(stat.question || { id: 0 }),
    response: stat.reponse?.libelle || stat.reponse?.code || ""
  };
}

export function statsForQuestion(questionId: number, stats: LegacyStat[]): QuestionStats {
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
