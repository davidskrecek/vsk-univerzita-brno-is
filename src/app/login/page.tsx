"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import AppButton from "@/components/Common/AppButton";
import LabeledInput from "@/components/Common/LabeledInput";
import { useToast } from "@/hooks/useToast";

const DEFAULT_LOGIN_ERROR = "Přihlášení se nepodařilo.";

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Neplatný e-mail nebo heslo.",
  AccountLocked: "Účet je dočasně uzamčen. Zkuste to prosím později.",
};

const getLoginErrorMessage = (code?: string | null) => {
  if (!code) return DEFAULT_LOGIN_ERROR;
  return LOGIN_ERROR_MESSAGES[code] ?? DEFAULT_LOGIN_ERROR;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const canSubmit = credentials.email.trim().length > 0 && credentials.password.length > 0;

  const setEmail = (email: string) => {
    setCredentials((current) => ({ ...current, email }));
  };

  const setPassword = (password: string) => {
    setCredentials((current) => ({ ...current, password }));
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.warning("Vyplňte e-mail i heslo.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        callbackUrl,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        toast.error(getLoginErrorMessage(result?.error));
        return;
      }

      toast.success("Přihlášení proběhlo úspěšně.");
      router.push(result.url ?? callbackUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : DEFAULT_LOGIN_ERROR;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70svh] items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-md rounded-md border border-outline-variant/10 bg-surface-container-low p-6 shadow-ambient sm:p-8">
        <h1 className="mb-6 text-2xl font-display font-bold text-on-surface">Přihlášení</h1>
        <p className="mb-4 text-xs text-on-surface/50">
          Testovací účet: <strong>admin@vsk.cz</strong> / <strong>Admin1234!</strong>
        </p>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <LabeledInput
            label="E-mail"
            value={credentials.email}
            onChange={setEmail}
            type="email"
            autoComplete="email"
            required
          />
          <LabeledInput
            label="Heslo"
            value={credentials.password}
            onChange={setPassword}
            type="password"
            autoComplete="current-password"
            required
          />
          
          <AppButton type="submit" variant="primary" className="w-full" disabled={loading || !canSubmit}>
            {loading ? "Přihlašuji..." : "Přihlásit se"}
          </AppButton>
        </form>
      </div>
    </div>
  );
}