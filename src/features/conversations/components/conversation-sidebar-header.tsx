import { HistoryIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCreateConversation } from "../hooks/use-conversations";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { Doc } from "../../../../convex/_generated/dataModel";

interface ConversationSidebarHeaderProps {
  activeConversation: Doc<"conversations"> | undefined;
  setPastConversationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateConversation: () => Promise<
    (string & { __tableName: "conversations" }) | null
  >;
}

export const ConversationSidebarHeader = ({
  activeConversation,
  setPastConversationOpen,
  handleCreateConversation,
}: ConversationSidebarHeaderProps) => {
  const createConversation = useCreateConversation();

  return (
    <div className="h-8.75 flex items-center justify-between border-b">
      <div className="text-sm truncate pl-3">
        {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
      </div>
      <div className="flex items-center px-1 gap-1">
        <Button
          size="icon-xs"
          variant="highlight"
          onClick={() => setPastConversationOpen(true)}
        >
          <HistoryIcon className="size-3.5" />
        </Button>
        <Button
          size="icon-xs"
          variant="highlight"
          onClick={handleCreateConversation}
        >
          <PlusIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};
