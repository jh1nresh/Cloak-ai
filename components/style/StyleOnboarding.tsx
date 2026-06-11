"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ArrowRight, Camera, LockKeyhole, Sparkles } from "lucide-react";
import {
  createDefaultProfile,
  fitPriorityLabels,
  intentLabels,
  personaLabels,
  STYLE_PROFILE_STORAGE_KEY,
  type FitPriority,
  type ShoppingIntent,
  type StylePersona,
  type StyleProfile,
} from "@/lib/style-profile";

const personaOptions = Object.entries(personaLabels) as [StylePersona, string][];
const intentOptions = Object.entries(intentLabels) as [ShoppingIntent, string][];
const fitOptions = Object.entries(fitPriorityLabels) as [FitPriority, string][];
const colorOptions = ["Pearl", "Ivory", "Cherry", "Plum", "Espresso", "Charcoal", "Smoke", "Soft grey"];

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export default function StyleOnboarding() {
  const router = useRouter();
  const [profile, setProfile] = useState<StyleProfile>(() => createDefaultProfile());
  const [error, setError] = useState<string | null>(null);

  const updateProfile = <K extends keyof StyleProfile>(key: K, value: StyleProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const nextProfile: StyleProfile = {
      ...profile,
      name: String(form.get("name") || profile.name).trim(),
      email: String(form.get("email") || profile.email).trim(),
      savedFitPhotoName: String(form.get("savedFitPhotoName") || profile.savedFitPhotoName || "").trim(),
      createdAt: new Date().toISOString(),
    };

    if (!nextProfile.name) {
      setError("Add your name so Cloak can personalize recommendations.");
      return;
    }
    if (!nextProfile.email || !nextProfile.email.includes("@")) {
      setError("Use an email-shaped login for this V1 demo.");
      return;
    }
    if (nextProfile.colors.length === 0 || nextProfile.intents.length === 0 || nextProfile.fitPriorities.length === 0) {
      setError("Choose at least one color, shopping moment, and fit priority.");
      return;
    }

    window.localStorage.setItem(STYLE_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    router.push("/stylist");
  };

  return (
    <main className="min-h-dvh bg-background text-primary">
      <section className="mx-auto grid min-h-dvh max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <aside className="flex flex-col justify-between border border-line bg-[#221d1b] p-5 text-white sm:p-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Cloak AI</p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl">
              Your personal fashion designer.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Stop uploading a photo for every single garment. Save one fit photo, tell Cloak how you want to look, then get ranked pieces from Shopify-style catalogs.
            </p>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-white/75">
            <div className="flex gap-3 border border-white/10 bg-white/5 p-3">
              <LockKeyhole className="mt-0.5 shrink-0 text-[#e7b7ad]" size={18} />
              <p>V1 login is local-demo only. No password, no backend auth, no secrets.</p>
            </div>
            <div className="flex gap-3 border border-white/10 bg-white/5 p-3">
              <Camera className="mt-0.5 shrink-0 text-[#e7b7ad]" size={18} />
              <p>Fit photo is a saved preference name in this demo; real upload/storage comes after provider choice.</p>
            </div>
          </div>
        </aside>

        <section className="border border-line bg-panel p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles size={18} aria-hidden="true" />
            <p className="section-title">Style onboarding</p>
          </div>
          <form className="mt-5 grid gap-5" onSubmit={saveProfile}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="field-label">Name</span>
                <input
                  name="name"
                  className="input"
                  value={profile.name}
                  onChange={(event) => updateProfile("name", event.target.value)}
                  placeholder="Jhi"
                />
              </label>
              <label>
                <span className="field-label">Email login</span>
                <input
                  name="email"
                  className="input"
                  type="email"
                  value={profile.email}
                  onChange={(event) => updateProfile("email", event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <div>
              <p className="field-label">Which designer should Cloak become for you?</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {personaOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateProfile("persona", value)}
                    className={`border p-3 text-left text-sm font-semibold transition ${
                      profile.persona === value ? "border-primary bg-primary text-white" : "border-line bg-white text-primary"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <MultiSelect
              title="Color lanes"
              options={colorOptions.map((color) => [color, color] as const)}
              values={profile.colors}
              onToggle={(value) => updateProfile("colors", toggleValue(profile.colors, value))}
            />

            <MultiSelect
              title="Where are you shopping for?"
              options={intentOptions}
              values={profile.intents}
              onToggle={(value) => updateProfile("intents", toggleValue(profile.intents, value))}
            />

            <MultiSelect
              title="What should the stylist protect?"
              options={fitOptions}
              values={profile.fitPriorities}
              onToggle={(value) => updateProfile("fitPriorities", toggleValue(profile.fitPriorities, value))}
            />

            <label>
              <span className="field-label">Saved fit photo label</span>
              <input
                name="savedFitPhotoName"
                className="input"
                value={profile.savedFitPhotoName || ""}
                onChange={(event) => updateProfile("savedFitPhotoName", event.target.value)}
                placeholder="Mirror selfie / clean front photo / later"
              />
              <span className="mt-2 block text-xs leading-5 text-muted">
                V1 does not store the image yet. It records the idea of a reusable fit photo so the product flow is not “upload again for every item.”
              </span>
            </label>

            {error ? <p className="border border-[#b42318] bg-[#fff7f6] p-3 text-sm font-semibold text-[#8a1f15]">{error}</p> : null}

            <button type="submit" className="btn-primary w-full">
              Create my stylist
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

type MultiSelectProps<T extends string> = {
  title: string;
  options: readonly (readonly [T, string])[];
  values: T[];
  onToggle: (value: T) => void;
};

function MultiSelect<T extends string>({ title, options, values, onToggle }: MultiSelectProps<T>) {
  return (
    <div>
      <p className="field-label">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`border px-3 py-2 text-xs font-semibold uppercase transition ${
              values.includes(value) ? "border-primary bg-primary text-white" : "border-line bg-white text-muted hover:border-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
