"use client";

import { useMemo, useState, useTransition } from "react";
import { LOCATION_OPTIONS } from "@/lib/profile-options";
import { CheckCircle2, Loader2, Save } from "lucide-react";

type Props = {
  user: {
    fullName?: string | null;
    phoneNumber?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    country?: string | null;
    state?: string | null;
    lga?: string | null;
    address?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    occupation?: string | null;
    preferredLanguage?: string | null;
  };
  onSave: (formData: FormData) => Promise<void>;
};

const languages = [
  { value: "english", label: "English" },
  { value: "yoruba", label: "Yoruba" },
  { value: "hausa", label: "Hausa" },
  { value: "igbo", label: "Igbo" },
];

export default function ProfileEditForm({ user, onSave }: Props) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const countries = Object.keys(LOCATION_OPTIONS);
  const [country, setCountry] = useState(user.country || countries[0] || "");

  const states = useMemo(() => {
    const nextStates = Object.keys(
      LOCATION_OPTIONS[country as keyof typeof LOCATION_OPTIONS] ?? {}
    );
    return nextStates;
  }, [country]);

  const [selectedState, setSelectedState] = useState(user.state || states[0] || "");

  const lgas = useMemo(() => {
    const countryOptions = LOCATION_OPTIONS[country as keyof typeof LOCATION_OPTIONS];
    return (
      (countryOptions?.[
        selectedState as keyof typeof countryOptions
      ] as readonly string[] | undefined) ?? []
    );
  }, [country, selectedState]);

  const [selectedLga, setSelectedLga] = useState(user.lga || lgas[0] || "");

  function onCountryChange(value: string) {
    const nextStates = Object.keys(
      LOCATION_OPTIONS[value as keyof typeof LOCATION_OPTIONS] ?? {}
    );
    setCountry(value);
    const firstState = nextStates[0] || "";
    setSelectedState(firstState);

    const countryOptions = LOCATION_OPTIONS[value as keyof typeof LOCATION_OPTIONS];
    const nextLgas = (countryOptions?.[firstState as keyof typeof countryOptions] as readonly string[]) || [];
    setSelectedLga(nextLgas[0] || "");
  }

  function onStateChange(value: string) {
    setSelectedState(value);
    const countryOptions = LOCATION_OPTIONS[country as keyof typeof LOCATION_OPTIONS];
    const nextLgas = (countryOptions?.[value as keyof typeof countryOptions] as readonly string[]) || [];
    setSelectedLga(nextLgas[0] || "");
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(false);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <h3 className="text-sm font-bold text-foreground">Edit Profile Information</h3>
        {success && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 dark:text-teal-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Changes saved
          </span>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Full Name
          </span>
          <input
            name="fullName"
            type="text"
            required
            defaultValue={user.fullName || ""}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Phone Number
          </span>
          <input
            name="phoneNumber"
            type="tel"
            required
            defaultValue={user.phoneNumber || ""}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Date of Birth
          </span>
          <input
            name="dateOfBirth"
            type="date"
            required
            defaultValue={user.dateOfBirth || ""}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Gender
          </span>
          <select
            name="gender"
            defaultValue={user.gender || "prefer_not_to_say"}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Country
          </span>
          <select
            name="country"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            State
          </span>
          <select
            name="state"
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Local Government (LGA)
          </span>
          <select
            name="lga"
            value={selectedLga}
            onChange={(e) => setSelectedLga(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
          >
            {lgas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </section>

      <label className="block space-y-1.5">
        <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Full Address
        </span>
        <input
          name="address"
          type="text"
          required
          defaultValue={user.address || ""}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
        />
      </label>

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Emergency Contact Name
          </span>
          <input
            name="emergencyContactName"
            type="text"
            required
            defaultValue={user.emergencyContactName || ""}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Emergency Contact Phone
          </span>
          <input
            name="emergencyContactPhone"
            type="tel"
            required
            defaultValue={user.emergencyContactPhone || ""}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Occupation
          </span>
          <input
            name="occupation"
            type="text"
            defaultValue={user.occupation || ""}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Preferred Language
          </span>
          <select
            name="preferredLanguage"
            defaultValue={user.preferredLanguage || "english"}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-4"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        <span>{isPending ? "Saving changes..." : "Save Profile Details"}</span>
      </button>
    </form>
  );
}
