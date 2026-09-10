import ResetForm from "@/components/admin/ResetForm";
import { BrandLogo } from "@/components/site/Logo";

export default function ResetPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLogo size={110} />
        </div>
        <ResetForm />
      </div>
    </div>
  );
}
