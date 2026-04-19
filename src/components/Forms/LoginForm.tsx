"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import AppButton from "@/components/Common/AppButton";
import LabeledInput from "@/components/Common/LabeledInput";
import { useToast } from "@/hooks/useToast";

interface LoginFormProps {
  onSuccess?: () => void;
  defaultCallbackUrl?: string;
}

const DEFAULT_LOGIN_ERROR = "Přihlášení se nepodařilo.";

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Neplatný e-mail nebo heslo.",
  AccountLocked: "Účet je dočasně uzamčen. Zkuste to prosím později.",
};

const getLoginErrorMessage = (code?: string | null) => {
  if (!code) return DEFAULT_LOGIN_ERROR;
  return LOGIN_ERROR_MESSAGES[code] ?? DEFAULT_LOGIN_ERROR;
};

type FormOnSubmit = NonNullable<ComponentPropsWithoutRef<"form">["onSubmit"]>;

export const LoginForm = ({ onSuccess, defaultCallbackUrl }: LoginFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const callbackUrl = searchParams.get("callbackUrl") ?? defaultCallbackUrl;
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleSubmit: FormOnSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.warning("Vyplňte e-mail i heslo.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        toast.error(getLoginErrorMessage(result?.error));
        return;
      }

      toast.success("Přihlášení proběhlo úspěšně.");
      onSuccess?.();

      if (result.url) {
        router.push(result.url);
      } else if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : DEFAULT_LOGIN_ERROR;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-6 text-2xl font-display font-bold text-on-surface">Přihlášení</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <LabeledInput label="E-mail" value={email} onChange={setEmail} type="email" autoComplete="email" required />
        <LabeledInput
          label="Heslo"
          value={password}
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
  );
};
