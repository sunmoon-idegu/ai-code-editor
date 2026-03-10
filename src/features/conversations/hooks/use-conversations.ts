import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useConversation = (conversationId: Id<"conversations"> | null) => {
  return useQuery(
    api.conversations.getById,
    conversationId ? { conversationId } : "skip",
  );
};

export const useMessages = (conversationId: Id<"conversations"> | null) => {
  return useQuery(
    api.conversations.getMessages,
    conversationId ? { conversationId } : "skip",
  );
};

export const useConversations = (projectId: Id<"projects"> | null) => {
  return useQuery(
    api.conversations.getByProject,
    projectId ? { projectId } : "skip",
  );
};

export const useCreateConversation = () => {
  return useMutation(api.conversations.create).withOptimisticUpdate(
    (localStorage, args) => {
      const existingConversations = localStorage.getQuery(
        api.conversations.getByProject,
        {
          projectId: args.projectId,
        },
      );

      if (existingConversations !== undefined) {
        const now = Date.now();
        const newConversation = {
          _id: crypto.randomUUID() as Id<"conversations">,
          _creationTime: now,
          projectId: args.projectId,
          title: args.title,
          createdAt: now,
          updatedAt: now,
        };

        localStorage.setQuery(
          api.conversations.getByProject,
          {
            projectId: args.projectId,
          },
          [newConversation, ...existingConversations],
        );
      }
    },
  );
};
