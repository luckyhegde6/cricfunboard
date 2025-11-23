// app/auth/signin/page.tsx

import SignInForm from "@/components/SignInForm";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <SignInForm callbackUrl="/" />
    </div>
  );
}
