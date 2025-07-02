import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import SignInClient from '@/app/auth/signin/SignInClient';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard'); // already signed in
  }

  return <SignInClient />;
}
