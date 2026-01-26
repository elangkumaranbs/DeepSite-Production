import { LoginButtons } from "@/components/login/login-buttons";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl: string }>;
}) {
  const { callbackUrl } = await searchParams;
  console.log(callbackUrl);
  return (
    <section className="min-h-screen font-sans">
      <div className="px-6 py-16 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-5">You shall not pass 🧙</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You can&apos;t access this resource without being signed in.
        </p>
        <LoginButtons callbackUrl={callbackUrl ?? "/"} />
      </div>
    </section>
  );
}
