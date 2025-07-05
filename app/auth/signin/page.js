'use client';

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const errorMessages = {
    Callback: 'There was a problem connecting to the authentication provider. Please try again later.',
    OAuthSignin: 'There was a problem signing in with Google. Please try again.',
    OAuthCallback: 'Authentication failed. Please try again.',
    OAuthCreateAccount: 'Could not create your account. Please contact support.',
    EmailCreateAccount: 'Could not create your account with email.',
    EmailSignin: 'There was a problem signing in with email.',
    CredentialsSignin: 'Invalid credentials. Please check your details and try again.',
    default: 'An unexpected error occurred. Please try again.'
  };
  const [error, setError] = useState(() => {
    const err = searchParams.get('error');
    return err ? errorMessages[err] || errorMessages.default : null;
  });

  useEffect(() => {
    if (session) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const callbackUrl = searchParams.get('from') || '/dashboard';
      await signIn('google', { 
        callbackUrl: callbackUrl,
        redirect: true
      });
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An error occurred during sign in');
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="text-base text-gray-600">
            Sign in to manage your finances with ease
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        <div className="mt-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="group w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              src="/google.svg"
              alt="Google Logo"
              width={24}
              height={24}
              priority
              className="group-hover:scale-110 transition-transform duration-200"
            />
            <span className="text-base">
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}