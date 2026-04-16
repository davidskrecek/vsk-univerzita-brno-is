import { ErrorScreen } from '@/components/Common/ErrorScreen';

export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="Stránka nenalezena"
      description="Omlouváme se, ale hledaná stránka neexistuje nebo byla přesunuta do jiné části našeho systému."
    />
  );
}
