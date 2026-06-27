"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useNotification } from "@/hooks/useNotification";
import { completeProfile, CompleteProfileState } from "./actions";
import { LOCATION_OPTIONS } from "@/lib/profile-options";
import { Button } from "@/components/ui/button";

const initialState: CompleteProfileState = {};

const languages = [
  { value: "english", label: "English" },
  { value: "yoruba", label: "Yoruba" },
  { value: "hausa", label: "Hausa" },
  { value: "igbo", label: "Igbo" },
];

export default function ProfileForm() {
  const [state, action, pending] = useActionState(completeProfile, initialState);
  const { notification, close, error: showError } = useNotification();
  const countries = Object.keys(LOCATION_OPTIONS);
  const [country, setCountry] = useState(countries[0] ?? "");
  const states = useMemo(
    () => Object.keys(LOCATION_OPTIONS[country as keyof typeof LOCATION_OPTIONS] ?? {}),
    [country]
  );
  const [selectedState, setSelectedState] = useState(states[0] ?? "");
  const [selectedLga, setSelectedLga] = useState("");
  const [lgaMode, setLgaMode] = useState<"select" | "custom">("select");
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
    setSelectedLga("");
    setLgaMode("select");
  }

  function onStateChange(value: string) {
    setSelectedState(value);
    setSelectedLga("");
    setLgaMode("select");
  }

  useEffect(() => {
    if (state.message && !state.errors) {
      showError(
        "Profile Update Failed",
        state.message || "Unable to complete your profile. Please try again."
      );
    }
  }, [state.message, state.errors, showError]);

  return (
    <>
      <Modal
        isOpen={notification.isOpen}
        onClose={close}
        type={notification.type}
        title={notification.title}
        description={notification.description}
        closeOnBackdropClick={!pending}
      />
      <form action={action} className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
        <span className="text-sm font-medium text-accent">Step 1 of 1</span>
        <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
      </div>

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
          onChange={(event) => onStateChange(event.target.value)}
          error={state.errors?.state}
        >
          {states.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <div>
          {lgaMode === "select" ? (
            <Select
              label="Local government area"
              name="lga"
              value={selectedLga}
              onChange={(e) => {
                if (e.target.value === "__custom__") {
                  setLgaMode("custom");
                } else {
                  setSelectedLga(e.target.value);
                }
              }}
              error={state.errors?.lga}
            >
              <option value="" disabled>Select LGA</option>
              {lgas.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="__custom__">Other (type manually)</option>
            </Select>
          ) : (
            <Field
              label="Local government area"
              name="lga"
              error={state.errors?.lga}
              placeholder="Type your LGA"
            />
          )}
          {lgaMode === "custom" && lgas.length > 0 && (
            <button
              type="button"
              onClick={() => setLgaMode("select")}
              className="mt-1 text-xs text-accent hover:underline"
            >
              Pick from list instead
            </button>
          )}
        </div>
      </section>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          Full address
        </span>
        <input
          name="address"
          autoComplete="street-address"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
        />
        <ErrorMessage error={state.errors?.address} />
      </label>

      <section className="grid gap-4 sm:grid-cols-2">
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

      <Button type="submit" variant="accent" fullWidth disabled={pending} className="mt-2">
        {pending ? "Saving..." : "Save profile"}
      </Button>
      </form>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
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
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <select
        name={name}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent"
        {...props}
      >
        {children}
      </select>
      <ErrorMessage error={error} />
    </label>
  );
}

function ErrorMessage({ error }: { error?: string }) {
  return error ? <span className="mt-1 block text-xs text-destructive">{error}</span> : null;
}
