import { file, z } from "zod";
import { createTool } from "@inngest/agent-kit";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface RenameFileToolOptions {
  internalKey: string;
}

const paramsSchema = z.object({
  fileId: z.string().min(1, "FileID is required"),
  newName: z.string().min(1, "New name is required"),
});

export const createRenameFileTool = ({
  internalKey,
}: RenameFileToolOptions) => {
  return createTool({
    name: "renameFile",
    description: "Rename a file or folder",
    parameters: z.object({
      fileId: z.string().describe("The ID of the file to be updated."),
      newName: z.string().describe("The new name for the file."),
    }),
    handler: async (params, { step: toolStep }) => {
      const parsed = paramsSchema.safeParse(params);
      if (!parsed.success) return `Error ${parsed.error.issues[0].message}`;

      const { fileId, newName } = parsed.data;

      // Validate file exists before running the step
      const file = await convex.query(api.system.getFileById, {
        internalKey,
        fileId: fileId as Id<"files">,
      });

      // Matters for agent
      if (!file) {
        return `Error: File with ID "${fileId}" not found. Use listFiles to get valid file IDs.`;
      }

      try {
        return await toolStep?.run("rename-file", async () => {
          await convex.mutation(api.system.renameFile, {
            internalKey,
            fileId: fileId as Id<"files">,
            newName,
          });

          return `Rename "${file.name}" to "${file.name}" successfully.`;
        });
      } catch (error) {
        return `Error renaming files: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    },
  });
};
