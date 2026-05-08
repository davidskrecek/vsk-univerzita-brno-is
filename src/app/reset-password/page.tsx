import SetPasswordForm from "@/components/Forms/SetPasswordForm";

type SetPasswordPageProps = {
    searchParams: Promise<{ token?: string; }>;
}

export default async function SetPasswordPage({searchParams}: SetPasswordPageProps) {
    const { token } = await searchParams;

    if(!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-surface-container rounded-2xl shadow-ambient p-8">
                    <h1 className="text-2xl font-bold mb-2">
                        Neplatný odkaz
                    </h1>
                    <p className="text-on-surface/70 text-sm">
                        Odkaz pro nastavení hesla je neplatný.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-surface-container rounded-2xl shadow-ambient p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">
                        Nastavení hesla
                    </h1>

                    <p className="text-on-surface/70 text-sm">
                        Zadejte nové heslo pro aktivaci účtu.
                    </p>
                </div>

                <SetPasswordForm token={token ?? ""} />
            </div>
        </div>
    );
}
