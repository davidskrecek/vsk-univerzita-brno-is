"use client";

import { useState } from "react";
import AppButton from "@/components/Common/AppButton";
import LabeledInput from "@/components/Common/LabeledInput";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulace API volání
      await new Promise(res => setTimeout(res, 1000));
      
      toast.success("Profil úspěšně aktualizován");
    } catch {
      toast.error("Nepodařilo se odeslat objednávku");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70svh] items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-md rounded-md border border-outline-variant/10 bg-surface-container-low p-6 shadow-ambient sm:p-8">
        <h1 className="mb-6 text-2xl font-display font-bold text-on-surface">Přihlášení</h1>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <LabeledInput label="E-mail" value={email} onChange={setEmail} type="email" />
          <LabeledInput label="Heslo" value={password} onChange={setPassword} type="password" />
          
          <AppButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Přihlašuji..." : "Přihlásit se"}
          </AppButton>
        </form>
      </div>
    </div>
  );
}