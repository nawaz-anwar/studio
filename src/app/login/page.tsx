import Image from 'next/image';
import LoginForm from './_components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
            <Image src="/logo.png" alt="Master Crete Logo" width={80} height={80} className="rounded-full mb-4" data-ai-hint="logo" />
            <h1 className="text-3xl font-bold tracking-tight">CreteFlow Admin</h1>
            <p className="text-muted-foreground">Sign in to manage your ERP.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
