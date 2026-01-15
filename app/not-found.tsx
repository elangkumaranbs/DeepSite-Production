import { NotFoundButtons } from "@/components/not-found/buttons";
import { Navigation } from "@/components/public/navigation";

export default function NotFound() {
  return (
    <div className="min-h-screen font-sans">
      <Navigation />
      <div className="px-6 py-16 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-5">Oh no! Page not found.</h1>
        <p className="text-lg text-muted-foreground mb-8">
          The page you are looking for does not exist.
        </p>
        <NotFoundButtons />
      </div>
    </div>
  );
}
