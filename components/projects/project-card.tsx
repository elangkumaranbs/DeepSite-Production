import { SpaceEntry } from "@huggingface/hub";

// from-red-500 to-red-500
// from-yellow-500 to-yellow-500
// from-green-500 to-green-500
// from-purple-500 to-purple-500
// from-blue-500 to-blue-500
// from-pink-500 to-pink-500
// from-gray-500 to-gray-500
// from-indigo-500 to-indigo-500

export function ProjectCard({ project }: { project: SpaceEntry }) {
  return (
    <a href={`/${project.name}`}>
      <div className="flex items-center justify-start gap-3 border-2 border-background ring-[1px] ring-border rounded-lg overflow-hidden transition-all hover:bg-accent">
        <div
          className={`size-10 bg-linear-to-br flex items-center justify-center text-lg from-${
            project?.cardData?.colorFrom || "blue"
          }-500 to-${project?.cardData?.colorTo || "purple"}-500`}
        >
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
