
'use client';

import * as React from 'react';
import Image from 'next/image';
import LoginForm from './_components/login-form';

export default function LoginPage() {
    const [logoError, setLogoError] = React.useState(false);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-6">
            <div className="flex flex-col items-center text-center">
                {logoError ? (
                    <h1 className="text-xl font-bold tracking-tight mb-4">Master Crete Building Contracting LLC</h1>
                ) : (
                    <Image 
                        src="https://storage.googleapis.com/aai-web-samples/logo-1722271285375.png" 
                        alt="Master Crete Logo" 
                        width={80} 
                        height={80} 
                        className="mb-4" 
                        data-ai-hint="logo"
                        onError={() => setLogoError(true)}
                    />
                )}
                <h1 className="text-3xl font-bold tracking-tight">CreteFlow Admin</h1>
                <p className="text-muted-foreground">Sign in to manage your ERP.</p>
            </div>
            <LoginForm />
        </div>
        </div>
    );
}
