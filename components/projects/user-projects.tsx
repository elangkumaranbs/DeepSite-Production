"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, TrashIcon } from "lucide-react";
import { useSession } from "next-auth/react";

import { useProjects } from "./useProjects";
import { Button } from "@/components/ui/button";
import { BigProjectCard } from "./big-project-card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function UserProjects() {
  const { data: session } = useSession();
  const { projects, isLoading, error, refetch } = useProjects();
  const [open, setOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [input, setInput] = useState<string>("");
  if (isLoading || error || !session?.user?.name) return null;

  const handleDeleteProject = async () => {
    const response = await fetch(
      `/api/projects/${deleteProjectId?.split("/")[1]}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then(async (response) => {
      if (response.ok) {
        return response.json();
      }
    });
    if (response?.success) {
      toast.success("Project has been deleted");
      refetch();
      setOpen(false);
      setDeleteProjectId(null);
      setInput("");
    } else {
      toast.error("Failed to delete project");
    }
  };

  return (
    <section id="projects" className="max-w-7xl px-6 mx-auto mt-10">
      <article className="border border-border bg-card rounded-xl p-5 lg:p-8">
        <header className="flex max-sm:flex-col items-center justify-between gap-4 border-b border-border pb-5 border-dashed">
          <div className="w-full -space-y-1">
            <p className="text-lg font-bold">
              <span className="capitalize">{session?.user?.name}</span>&apos;s
              projects
            </p>
            <p className="text-sm text-muted-foreground">
              Manage your projects and keep them organized.
            </p>
          </div>
          <Link href="/new" className="max-sm:w-full!">
            <Button variant="bordered" size="sm" className="max-sm:w-full!">
              <Plus className="size-4" />
              New project
            </Button>
          </Link>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {projects?.map((project) => (
            <BigProjectCard
              key={project.id}
              project={project}
              onOpenDeleteDialog={(id) => {
                setOpen(true);
                setDeleteProjectId(id);
              }}
            />
          ))}
          {projects?.length === 0 && (
            <Link href="/new" className="group/big-card">
              <div className="h-40 rounded-lg overflow-hidden transition-all border-2 border-background ring-[1px] ring-border relative bg-accent flex items-center justify-center hover:bg-accent/80">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                  <Plus className="size-4" />
                  New project
                </div>
              </div>
            </Link>
          )}
        </div>
      </article>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl!">
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              This action is irreversible. Are you sure you want to delete this
              project?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                Type{" "}
                <span className="font-bold text-primary">
                  {deleteProjectId}
                </span>{" "}
                to confirm deletion
              </p>
              <Input
                id="name-1"
                placeholder="Enter the project name"
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={input !== deleteProjectId}
              onClick={() => handleDeleteProject()}
            >
              <TrashIcon className="size-4" />
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
