export type Language = "english" | "yoruba" | "hausa" | "igbo";

export type AnalysisResult = {
  english: string;
  yoruba: string;
  hausa: string;
  igbo: string;
};

export type ReportStatus = "processing" | "completed" | "failed";
export type Gender = "male" | "female" | "prefer_not_to_say";

export type Report = {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  extractedText: string | null;
  englishResult: string | null;
  yorubaResult: string | null;
  hausaResult: string | null;
  igboResult: string | null;
  audioUrl: string | null;
  yorubaAudioUrl: string | null;
  hausaAudioUrl: string | null;
  igboAudioUrl: string | null;
  status: ReportStatus;
  createdAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  country: string | null;
  state: string | null;
  lga: string | null;
  address: string | null;
  gender: Gender | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  occupation: string | null;
  preferredLanguage: Language;
  profileCompleted: boolean;
};
