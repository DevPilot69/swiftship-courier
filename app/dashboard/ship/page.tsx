import { auth } from "@/auth";
import { ShipWizard } from "@/components/ship/ShipWizard";

export default async function ShipPage() {
  const session = await auth();
  return <ShipWizard user={session!.user!} />;
}
