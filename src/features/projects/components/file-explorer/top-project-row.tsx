import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  CopyMinusIcon,
  FilePlusCornerIcon,
  FolderPlusIcon,
} from "lucide-react";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

export const TopProjectRow = ({
  project,
  isOpen,
  setIsOpen,
  setCreating,
  setCollapseKey,
}: {
  project: Doc<"projects"> | undefined;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCreating: React.Dispatch<React.SetStateAction<"file" | "folder" | null>>;
  setCollapseKey: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <div
      role="button"
      onClick={() => {
        setIsOpen((value) => !value);
      }}
      className="group/project cursor-pointer w-full text-left
          flex items-center gap-0.5 h-5.5 bg-accent font-bold"
    >
      <ChevronRightIcon
        className={cn(
          "size-4 shrink-0 text-muted-foreground",
          isOpen && "rotate-90",
        )}
      />
      <p className="text-xs uppercase line-clamp-1">
        {project?.name ?? "Loading..."}
      </p>
      <div
        className="opacity-0 group-hover/project:opacity-100
            transition-none duration-0 flex items-center gap-0.5 ml-auto"
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsOpen(true);
            setCreating("file");
          }}
          variant="highlight"
          size="icon-xs"
        >
          <FilePlusCornerIcon className="size-3.5" />
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsOpen(true);
            setCreating("folder");
          }}
          variant="highlight"
          size="icon-xs"
        >
          <FolderPlusIcon className="size-3.5" />
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setCollapseKey((prev) => prev + 1);
          }}
          variant="highlight"
          size="icon-xs"
        >
          <CopyMinusIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};
