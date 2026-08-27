import { Suspense } from 'react';
import SignInPage from './page';

export default function SignInLayout() {
  return (
    <Suspense fallback={
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy"></div>
      </div>
    }>
      <SignInPage />
    </Suspense>
  );
}
