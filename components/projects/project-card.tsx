import { SpaceEntry } from "@huggingface/hub";

export function ProjectCard({ project }: { project: SpaceEntry }) {
  return (
    <a href={`/deepsite/${project.name}`}>
      <div className="flex items-center justify-start gap-3 border-2 border-background ring-[1px] ring-border rounded-lg overflow-hidden transition-all hover:bg-accent">
        <div className="size-10 bg-linear-to-br flex items-center justify-center text-lg from-blue-500 to-purple-500">
          {project?.cardData?.emoji || "🚀"}
        </div>
        <div className="flex flex-col p-0">
          <p className="text-xs font-semibold line-clamp-1">
            {project.cardData?.title}
          </p>
          <p className="text-[10px] text-muted-foreground line-clamp-1">
            {project.name}
          </p>
        </div>
      </div>
    </a>
  );
}
