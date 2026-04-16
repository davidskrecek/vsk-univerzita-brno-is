/**
 * Page shown when a user tries to access a page they don't have permission to view. 
 * Testing purpose only
 */

import { NotPermitted } from "@/components/Auth/NotPermitted";

export default function NotPermittedPage() {
  return <NotPermitted requiredRole="admin" />;
}
