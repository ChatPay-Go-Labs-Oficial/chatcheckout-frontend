import { AuthShowcase } from '@/components/auth/auth-showcase';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      <div className="flex flex-col p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center py-4">
          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg">{children}</div>
        </div>
      </div>
      <AuthShowcase />
    </div>
  );
}
