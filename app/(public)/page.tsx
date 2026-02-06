import { AnimatedDotsBackground } from "@/components/public/animated-dots-background";
import { HeroHeader } from "@/components/public/hero-header";
import { UserProjects } from "@/components/projects/user-projects";
import { AskAiLanding } from "@/components/ask-ai/ask-ai-landing";
import { Bento } from "@/components/public/bento";

export const dynamic = "force-dynamic";

export default async function Homepage() {
  return (
    <>
      <section className="container mx-auto relative z-10">
        <HeroHeader />
        <div className="absolute inset-0 -z-10">
          <AnimatedDotsBackground />
        </div>
        <div className="max-w-xl mx-auto px-6">
          <AskAiLanding />
        </div>
      </section>
      <UserProjects />
      <Bento />
    </>
  );
}
