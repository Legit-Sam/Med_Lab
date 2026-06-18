export const GENDER_OPTIONS = ["male", "female", "prefer_not_to_say"] as const;

export const LANGUAGE_OPTIONS = ["english", "yoruba", "hausa", "igbo"] as const;

export const LOCATION_OPTIONS = {
  Nigeria: {
    Lagos: ["Alimosho", "Ikeja", "Eti-Osa", "Surulere", "Kosofe"],
    Oyo: ["Ibadan North", "Ibadan South-West", "Ogbomosho North", "Oyo East"],
    Osun: ["Osogbo", "Ife Central", "Ede North", "Ilesa East"],
  },
  "United States": {
    California: ["Los Angeles County", "San Diego County", "Santa Clara County"],
    "New York": ["New York County", "Kings County", "Queens County"],
    Texas: ["Harris County", "Dallas County", "Travis County"],
  },
} as const;

export type GenderOption = (typeof GENDER_OPTIONS)[number];
export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];
export type CountryOption = keyof typeof LOCATION_OPTIONS;

export function isKnownLocation(country: string, state: string, lga: string) {
  const states = LOCATION_OPTIONS[country as CountryOption];
  if (!states) return false;

  const lgas = states[state as keyof typeof states];
  return Array.isArray(lgas) && (lgas as readonly string[]).includes(lga);
}
