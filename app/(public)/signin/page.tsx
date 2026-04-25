import { LoginButtons } from "@/components/login/login-buttons";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl: string }>;
}) {
  const { callbackUrl } = await searchParams;
  console.log(callbackUrl);
  return (
    <section className="min-h-screen font-sans flex flex-col justify-center pb-24">
      <div className="px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-5">You shall not pass 🧙</h1>
        <p className="text-lg text-muted-foreground mb-4">
          You need an Access Token to run Inference API Models.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          You can generate a free token from your{" "}
          <a
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Hugging Face Settings
          </a>.
        </p>

        <LoginButtons callbackUrl={callbackUrl ?? "/"} />
      </div>
    </section>
  );
}
