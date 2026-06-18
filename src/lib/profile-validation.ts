import { GENDER_OPTIONS, isKnownLocation, LANGUAGE_OPTIONS } from "./profile-options";

export type ProfileFormErrors = Partial<
  Record<
    | "fullName"
    | "phoneNumber"
    | "dateOfBirth"
    | "country"
    | "state"
    | "lga"
    | "address"
    | "gender"
    | "emergencyContactName"
    | "emergencyContactPhone"
    | "preferredLanguage",
    string
  >
>;

export type ValidProfileInput = {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  state: string;
  lga: string;
  address: string;
  gender: "male" | "female" | "prefer_not_to_say" | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  occupation: string | null;
  preferredLanguage: "english" | "yoruba" | "hausa" | "igbo";
};

const phonePattern = /^\+?[0-9][0-9\s().-]{7,19}$/;

function read(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function validateProfileForm(formData: FormData):
  | { success: true; data: ValidProfileInput }
  | { success: false; errors: ProfileFormErrors } {
  const fullName = read(formData, "fullName");
  const phoneNumber = read(formData, "phoneNumber");
  const dateOfBirth = read(formData, "dateOfBirth");
  const country = read(formData, "country");
  const state = read(formData, "state");
  const lga = read(formData, "lga");
  const address = read(formData, "address");
  const genderValue = read(formData, "gender");
  const emergencyContactName = read(formData, "emergencyContactName");
  const emergencyContactPhone = read(formData, "emergencyContactPhone");
  const occupation = read(formData, "occupation");
  const preferredLanguage = read(formData, "preferredLanguage") || "yoruba";

  const errors: ProfileFormErrors = {};

  if (!fullName) errors.fullName = "Enter your full name.";
  if (!phonePattern.test(phoneNumber)) errors.phoneNumber = "Enter a valid phone number.";

  const dob = new Date(`${dateOfBirth}T00:00:00.000Z`);
  const now = new Date();
  if (!dateOfBirth || Number.isNaN(dob.getTime())) {
    errors.dateOfBirth = "Choose your date of birth.";
  } else if (dob > now) {
    errors.dateOfBirth = "Date of birth cannot be in the future.";
  } else {
    const age = now.getUTCFullYear() - dob.getUTCFullYear();
    if (age > 120) errors.dateOfBirth = "Enter a realistic date of birth.";
  }

  if (!country) errors.country = "Select your country.";
  if (!state) errors.state = "Select your state.";
  if (!lga) errors.lga = "Select your local government area.";
  if (country && state && lga && !isKnownLocation(country, state, lga)) {
    errors.lga = "Select a valid local government area.";
  }

  if (address.length < 10) errors.address = "Enter an address with at least 10 characters.";
  if (!emergencyContactName) {
    errors.emergencyContactName = "Enter an emergency contact name.";
  }
  if (!phonePattern.test(emergencyContactPhone)) {
    errors.emergencyContactPhone = "Enter a valid emergency contact phone number.";
  }
  if (genderValue && !GENDER_OPTIONS.includes(genderValue as never)) {
    errors.gender = "Select a valid gender option.";
  }
  if (!LANGUAGE_OPTIONS.includes(preferredLanguage as never)) {
    errors.preferredLanguage = "Select a valid preferred language.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      fullName,
      phoneNumber,
      dateOfBirth,
      country,
      state,
      lga,
      address,
      gender: genderValue ? (genderValue as ValidProfileInput["gender"]) : null,
      emergencyContactName,
      emergencyContactPhone,
      occupation: occupation || null,
      preferredLanguage: preferredLanguage as ValidProfileInput["preferredLanguage"],
    },
  };
}
