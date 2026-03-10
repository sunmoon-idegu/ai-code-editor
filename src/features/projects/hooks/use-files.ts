import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

// Sort: folders first, then files, alphabetically in each group
const sortFiles = <T extends { type: "file" | "folder"; name: string }>(
  files: T[],
): T[] => {
  return [...files].sort((a, b) => {
    if (a.type === "folder" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name);
  });
};

export const useFile = (fileId: Id<"files"> | null) => {
  return useQuery(api.files.getFile, fileId ? { id: fileId } : "skip");
};

export const useFiles = (projectId: Id<"projects"> | null) => {
  return useQuery(api.files.getFiles, projectId ? { projectId } : "skip");
};

export const useFilePath = (fileId: Id<"files"> | null) => {
  return useQuery(api.files.getFilePath, fileId ? { id: fileId } : "skip");
};

export const useCreateFile = () => {
  return useMutation(api.files.createFile).withOptimisticUpdate(
    (localStorage, args) => {
      const existingFiles = localStorage.getQuery(api.files.getFolderContents, {
        projectId: args.projectId,
        parentId: args.parentId,
      });

      if (existingFiles !== undefined) {
        const now = Date.now();
        const newFile = {
          _id: crypto.randomUUID() as Id<"files">,
          _creationTime: now,
          projectId: args.projectId,
          parentId: args.parentId,
          name: args.name,
          content: args.content,
          type: "file" as const,
          updatedAt: now,
        };
        localStorage.setQuery(
          api.files.getFolderContents,
          { projectId: args.projectId, parentId: args.parentId },
          sortFiles([...existingFiles, newFile]),
        );
      }
    },
  );
};

export const useUpdateFile = () => {
  return useMutation(api.files.updateFile);
};

export const useRenameFile = ({
  projectId,
  parentId,
}: {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
}) => {
  return useMutation(api.files.renameFile).withOptimisticUpdate(
    (localStorage, args) => {
      const existingFiles = localStorage.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      });

      if (existingFiles !== undefined) {
        const updateFiles = existingFiles.map((file) =>
          file._id === args.id ? { ...file, name: args.newName } : file,
        );
        localStorage.setQuery(
          api.files.getFolderContents,
          { projectId, parentId },
          sortFiles(updateFiles),
        );
      }
    },
  );
};

export const useDeleteFile = ({
  projectId,
  parentId,
}: {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
}) => {
  return useMutation(api.files.deleteFile).withOptimisticUpdate(
    (localStorage, args) => {
      const existingFiles = localStorage.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      });

      if (existingFiles !== undefined) {
        localStorage.setQuery(
          api.files.getFolderContents,
          { projectId, parentId },
          existingFiles.filter((file) => file._id !== args.id),
        );
      }
    },
  );
};

export const useCreateFolder = () => {
  return useMutation(api.files.createFolder).withOptimisticUpdate(
    (localStorage, args) => {
      const existingFiles = localStorage.getQuery(api.files.getFolderContents, {
        projectId: args.projectId,
        parentId: args.parentId,
      });

      if (existingFiles !== undefined) {
        const now = Date.now();
        const newFolder = {
          _id: crypto.randomUUID() as Id<"files">,
          _creationTime: now,
          projectId: args.projectId,
          parentId: args.parentId,
          name: args.name,
          content: "",
          type: "folder" as const,
          updatedAt: now,
        };
        localStorage.setQuery(
          api.files.getFolderContents,
          { projectId: args.projectId, parentId: args.parentId },
          sortFiles([...existingFiles, newFolder]),
        );
      }
    },
  );
  // TODO: add optimistic mutation
};

export const useFolderContents = ({
  projectId,
  parentId,
  enabled = true,
}: {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
  enabled?: boolean;
}) => {
  return useQuery(
    api.files.getFolderContents,
    enabled ? { projectId, parentId } : "skip",
  );
};
