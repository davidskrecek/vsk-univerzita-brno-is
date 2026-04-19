import { ErrorScreen } from "@/components/Common/ErrorScreen";

interface NotPermittedProps {
  requiredRole?: string;
}

export const NotPermitted = ({ requiredRole }: NotPermittedProps) => {
  const description = requiredRole
    ? `Tato stránka vyžaduje roli „${requiredRole}“. Nemáte dostatečná oprávnění pro zobrazení tohoto obsahu.`
    : "Nemáte dostatečná oprávnění pro zobrazení tohoto obsahu.";

  return (
    <ErrorScreen
      code="403"
      title="Přístup odepřen"
      description={description}
    />
  );
};

export default NotPermitted;
