import { useState } from "react";
import { toast } from "sonner";

import {
  useConversation,
  useConversations,
  useCreateConversation,
  useMessages,
} from "../hooks/use-conversations";

import { Id } from "../../../../convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { PastConversationDialog } from "./past-conversations-dialog";
import { ConversationSidebarHeader } from "./conversation-sidebar-header";
import { ConversationSidebarPromptInput } from "./conversation-sidebar-prompt-input";
import { ConversationSidebarMessages } from "./conversation-sidebar-messages";

interface ConversationSidebarProps {
  projectId: Id<"projects">;
}

export const ConversationSidebar = ({
  projectId,
}: ConversationSidebarProps) => {
  const [pastConversationOpen, setPastConversationOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);

  const createConversation = useCreateConversation();
  const conversations = useConversations(projectId);

  const activeConversationId =
    selectedConversationId ?? conversations?.[0]?._id ?? null;
  const activeConversation = useConversation(activeConversationId);
  const conversationMessages = useMessages(activeConversationId);
  const isProcessing = conversationMessages?.some(
    (msg) => msg.status === "processing",
  );

  const handleCreateConversation = async () => {
    try {
      const newConversationId = await createConversation({
        projectId,
        title: DEFAULT_CONVERSATION_TITLE,
      });
      setSelectedConversationId(newConversationId);
      return newConversationId;
    } catch {
      toast.error("Unable to create new conversation");
      return null;
    }
  };

  return (
    <>
      <PastConversationDialog
        projectId={projectId}
        open={pastConversationOpen}
        onOpenChange={setPastConversationOpen}
        onSelect={setSelectedConversationId}
      />
      <div className="flex flex-col h-full bg-sidebar">
        <ConversationSidebarHeader
          activeConversation={activeConversation}
          setPastConversationOpen={setPastConversationOpen}
          handleCreateConversation={handleCreateConversation}
        />
        <ConversationSidebarMessages 
          conversationMessages={conversationMessages}
        />
        <ConversationSidebarPromptInput
          projectId={projectId}
          isProcessing={isProcessing}
          activeConversationId={activeConversationId}
          handleCreateConversation={handleCreateConversation}
        />
      </div>
    </>
  );
};
