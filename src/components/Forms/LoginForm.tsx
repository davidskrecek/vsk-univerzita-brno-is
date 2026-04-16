"use client";

import { useState } from "react";
import AppButton from "@/components/Common/AppButton";
import LabeledInput from "@/components/Common/LabeledInput";
import { useToast } from "@/hooks/useToast";

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (formData: FormData) => {
    void formData; // will be used when real auth is wired up
    setLoading(true);

    try {
      // Mocked login logic — replace with signIn() call later
      await new Promise(res => setTimeout(res, 1000));

      toast.success("Přihlášení proběhlo úspěšně");
      onSuccess?.();
    } catch {
      toast.error("Chyba při přihlašování");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-6 text-2xl font-display font-bold text-on-surface">Přihlášení</h1>

      <form action={handleSubmit} className="space-y-4">
        <LabeledInput label="E-mail" value={email} onChange={setEmail} type="email" />
        <LabeledInput label="Heslo" value={password} onChange={setPassword} type="password" />

        <AppButton type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Přihlašuji..." : "Přihlásit se"}
        </AppButton>
      </form>
    </div>
  );
};
