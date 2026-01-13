import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

export const NotAuthorizedDomain = ({ hostname }: { hostname: string }) => {
  return (
    <section className="h-screen w-full flex items-center justify-center">
      <div className="max-w-md text-center p-6">
        <Image
          src="/logo.svg"
          alt="DeepSite"
          width={48}
          height={48}
          className="mb-6 mx-auto"
        />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Unfortunately, you don&apos;t have access to DeepSite from this
          domain:{" "}
          <span className="font-mono font-semibold bg-indigo-500/10 border-2 border-indigo-500/10 text-indigo-500 text-base px-2 py-1 rounded-md">
            {hostname}
          </span>
          .
        </p>
        <Link href="https://huggingface.co/deepsite" target="_blank">
          <Button size="lg" className="text-base!">
            Go to DeepSite
          </Button>
        </Link>
      </div>
    </section>
  );
};
