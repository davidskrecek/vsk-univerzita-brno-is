"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/Forms/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-[70svh] items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-md rounded-md border border-outline-variant/10 bg-surface-container-low p-6 shadow-ambient sm:p-8">
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}