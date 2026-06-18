"use client";

import { useMemo, useState, useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { completeProfile, CompleteProfileState } from "./actions";
import { LOCATION_OPTIONS } from "@/lib/profile-options";

const initialState: CompleteProfileState = {};

const languages = [
  { value: "english", label: "English" },
  { value: "yoruba", label: "Yoruba" },
  { value: "hausa", label: "Hausa" },
  { value: "igbo", label: "Igbo" },
];

export default function ProfileForm() {
  const [state, action, pending] = useActionState(completeProfile, initialState);
  const countries = Object.keys(LOCATION_OPTIONS);
  const [country, setCountry] = useState(countries[0] ?? "");
  const states = useMemo(
    () => Object.keys(LOCATION_OPTIONS[country as keyof typeof LOCATION_OPTIONS] ?? {}),
    [country]
  );
  const [selectedState, setSelectedState] = useState(states[0] ?? "");
  const lgas = useMemo(() => {
    const countryOptions = LOCATION_OPTIONS[country as keyof typeof LOCATION_OPTIONS];
    return (
      (countryOptions?.[
        selectedState as keyof typeof countryOptions
      ] as readonly string[] | undefined) ?? []
    );
  }, [country, selectedState]);

  function onCountryChange(value: string) {
    const nextStates = Object.keys(
      LOCATION_OPTIONS[value as keyof typeof LOCATION_OPTIONS] ?? {}
    );
    setCountry(value);
    setSelectedState(nextStates[0] ?? "");
  }

  return (
    <form action={action} className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3">
        <span className="text-sm font-medium text-green-300">Step 1 of 1</span>
        <CheckCircle2 className="h-5 w-5 text-green-300" aria-hidden="true" />
      </div>

      {state.message ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          name="fullName"
          autoComplete="name"
          error={state.errors?.fullName}
        />
        <Field
          label="Phone number"
          name="phoneNumber"
          type="tel"
          autoComplete="tel"
          error={state.errors?.phoneNumber}
        />
        <Field
          label="Date of birth"
          name="dateOfBirth"
          type="date"
          error={state.errors?.dateOfBirth}
        />
        <Select label="Gender" name="gender" error={state.errors?.gender}>
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </Select>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Country"
          name="country"
          value={country}
          onChange={(event) => onCountryChange(event.target.value)}
          error={state.errors?.country}
        >
          {countries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select
          label="State"
          name="state"
          value={selectedState}
          onChange={(event) => setSelectedState(event.target.value)}
          error={state.errors?.state}
        >
          {states.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select label="Local government area" name="lga" error={state.errors?.lga}>
          {lgas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </section>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-200">
          Full address
        </span>
        <input
          name="address"
          autoComplete="street-address"
          className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-green-500"
        />
        <ErrorMessage error={state.errors?.address} />
      </label>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Emergency contact name"
          name="emergencyContactName"
          error={state.errors?.emergencyContactName}
        />
        <Field
          label="Emergency contact phone"
          name="emergencyContactPhone"
          type="tel"
          error={state.errors?.emergencyContactPhone}
        />
        <Field label="Occupation" name="occupation" />
        <Select
          label="Preferred language"
          name="preferredLanguage"
          defaultValue="english"
          error={state.errors?.preferredLanguage}
        >
          {languages.map((language) => (
            <option key={language.value} value={language.value}>
              {language.label}
            </option>
          ))}
        </Select>
      </section>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-green-500"
      />
      <ErrorMessage error={error} />
    </label>
  );
}

function Select({
  label,
  name,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>
      <select
        name={name}
        className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-green-500"
        {...props}
      >
        {children}
      </select>
      <ErrorMessage error={error} />
    </label>
  );
}

function ErrorMessage({ error }: { error?: string }) {
  return error ? <span className="mt-1 block text-xs text-red-300">{error}</span> : null;
}
