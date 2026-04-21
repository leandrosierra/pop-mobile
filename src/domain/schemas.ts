import { z } from "zod";

const stringValue = z.preprocess((value) => (value == null ? "" : String(value)), z.string());
const numberValue = z.coerce.number().catch(0);

export const locationTypes = [
  "COUNTRY",
  "REGION",
  "DEPARTMENT",
  "CITY",
  "CIRCONSCRIPTION"
] as const;

export type LocationType = (typeof locationTypes)[number];

const normalizeLocationType = (value: unknown): LocationType => {
  const raw = String(value ?? "CITY").toUpperCase();
  return locationTypes.includes(raw as LocationType) ? (raw as LocationType) : "CITY";
};

export const popLocationSchema = z
  .object({
    code: stringValue,
    id: stringValue.optional(),
    libelle: stringValue.optional(),
    label: stringValue.optional(),
    name: stringValue.optional(),
    type: z.unknown().optional()
  })
  .transform((value) => ({
    id: value.code || value.id || "",
    label: value.libelle || value.label || value.name || value.code || "",
    type: normalizeLocationType(value.type)
  }));

export const popInterestSchema = z
  .object({
    code: stringValue,
    libelle: stringValue.optional(),
    label: stringValue.optional()
  })
  .transform((value) => ({
    code: value.code,
    label: value.libelle || value.label || value.code
  }));

export const userInterestSchema = z
  .object({
    code: stringValue,
    libelle: stringValue.optional(),
    label: stringValue.optional(),
    priority: numberValue.optional()
  })
  .transform((value) => ({
    code: value.code,
    label: value.libelle || value.label || value.code,
    priority: value.priority ?? 0
  }));

export const popQuestionSchema = z
  .object({
    id: numberValue,
    questionTitle: stringValue,
    creator: stringValue,
    questionDesc: stringValue.optional(),
    questionDescription: stringValue.optional(),
    status: stringValue.optional(),
    createdAt: stringValue.optional(),
    dateCreation: stringValue.optional(),
    creationDate: stringValue.optional(),
    updatedAt: stringValue.optional(),
    dateModification: stringValue.optional()
  })
  .transform((value) => ({
    id: value.id,
    questionTitle: value.questionTitle,
    creator: value.creator,
    questionDesc: value.questionDesc || value.questionDescription || "",
    status: value.status || "",
    createdAt: value.createdAt || value.dateCreation || value.creationDate || "",
    updatedAt: value.updatedAt || value.dateModification || ""
  }));

export const popAnsweredQuestionSchema = z
  .object({
    id: numberValue,
    questionTitle: stringValue,
    questionDescription: stringValue,
    creator: stringValue,
    response: stringValue,
    createdAt: stringValue.optional(),
    dateCreation: stringValue.optional(),
    answeredAt: stringValue.optional(),
    answerDate: stringValue.optional(),
    updatedAt: stringValue.optional(),
    dateModification: stringValue.optional()
  })
  .transform((value) => ({
    id: value.id,
    questionTitle: value.questionTitle,
    questionDesc: value.questionDescription,
    creator: value.creator,
    response: value.response,
    createdAt: value.createdAt || value.dateCreation || "",
    answeredAt: value.answeredAt || value.answerDate || value.dateModification || value.createdAt || value.dateCreation || "",
    updatedAt: value.updatedAt || value.dateModification || ""
  }));

export const questionStatsSchema = z
  .object({
    yes: numberValue,
    no: numberValue,
    neutral: numberValue
  })
  .transform((value) => ({
    yes: value.yes,
    no: value.no,
    neutral: value.neutral
  }));

export const popQuestionDetailSchema = z
  .object({
    id: numberValue,
    questionTitle: stringValue,
    questionDesc: stringValue,
    createdAt: stringValue.optional(),
    dateCreation: stringValue.optional(),
    creationDate: stringValue.optional(),
    updatedAt: stringValue.optional(),
    dateModification: stringValue.optional(),
    geoTags: z.array(popLocationSchema).optional().default([]),
    interestTags: z.array(popInterestSchema).optional().default([]),
    stats: questionStatsSchema.optional().default({ yes: 0, no: 0, neutral: 0 })
  })
  .transform((value) => ({
    id: value.id,
    questionTitle: value.questionTitle,
    questionDesc: value.questionDesc,
    createdAt: value.createdAt || value.dateCreation || value.creationDate || "",
    updatedAt: value.updatedAt || value.dateModification || "",
    geoTags: value.geoTags,
    interestTags: value.interestTags,
    stats: value.stats
  }));

export const popUserSchema = z
  .object({
    uid: stringValue,
    name: stringValue,
    email: stringValue.optional(),
    emailId: stringValue.optional(),
    language: stringValue.optional(),
    preferredLanguage: stringValue.optional(),
    languageCode: stringValue.optional(),
    role: stringValue.optional(),
    userChoiceGeoDtoList: z.array(popLocationSchema).optional().default([]),
    userChoiceGeo: z.array(popLocationSchema).optional().default([]),
    interest: z.array(userInterestSchema).optional().default([])
  })
  .transform((value) => ({
    uid: value.uid,
    name: value.name,
    email: value.email || value.emailId || "",
    language: value.language || value.preferredLanguage || value.languageCode || "fr",
    role: value.role || "USER",
    userChoiceGeo: value.userChoiceGeoDtoList.length ? value.userChoiceGeoDtoList : value.userChoiceGeo,
    userInterest: value.interest
  }));

export const emailLoginResponseSchema = z.object({
  token: stringValue,
  refreshToken: stringValue
});

export const refreshTokenResponseSchema = z
  .object({
    accessToken: stringValue,
    refreshToken: stringValue
  })
  .transform((value) => ({
    token: value.accessToken,
    refreshToken: value.refreshToken
  }));

export const interestListResponseSchema = z.object({
  interestList: z.array(popInterestSchema).optional().default([])
});

export type PopLocation = z.infer<typeof popLocationSchema>;
export type PopInterest = z.infer<typeof popInterestSchema>;
export type UserInterest = z.infer<typeof userInterestSchema>;
export type PopQuestion = z.infer<typeof popQuestionSchema>;
export type PopAnsweredQuestion = z.infer<typeof popAnsweredQuestionSchema>;
export type PopQuestionDetail = z.infer<typeof popQuestionDetailSchema>;
export type PopUser = z.infer<typeof popUserSchema>;
export type QuestionStats = z.infer<typeof questionStatsSchema>;
