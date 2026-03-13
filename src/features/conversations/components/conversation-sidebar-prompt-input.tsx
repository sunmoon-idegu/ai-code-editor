import { useState } from "react";
import ky from "ky";
import { toast } from "sonner";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";

import { Id } from "../../../../convex/_generated/dataModel";

interface ConversationSidebarPromptInputProps {
  projectId: Id<"projects">;
  isProcessing: boolean | undefined;
  activeConversationId: Id<"conversations"> | null;
  handleCreateConversation: () => Promise<
    (string & { __tableName: "conversations" }) | null
  >;
}

export const ConversationSidebarPromptInput = ({
  projectId,
  isProcessing,
  activeConversationId,
  handleCreateConversation,
}: ConversationSidebarPromptInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = async (message: PromptInputMessage) => {
    if (isProcessing && !message.text) {
      await handleCancel();
      setInput("");
      return;
    }

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) return; // ?
    }

    try {
      await ky.post("/api/messages", {
        json: {
          conversationId,
          message: message.text,
        },
      });
    } catch {
      toast.error("Message failed to send.");
    }

    setInput("");
  };

  const handleCancel = async () => {
    try {
      await ky.post("/api/messages/cancel", {
        json: { projectId },
      });
    } catch {
      toast.error("Unable to cancel request");
    }
  };

  return (
    <div className="p-3">
      <PromptInput onSubmit={handleSubmit} className="mt-2">
        <PromptInputBody>
          <PromptInputTextarea
            placeholder="Ask me anything..."
            onChange={(e) => setInput(e.target.value)}
            value={input}
            disabled={isProcessing}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools />
          <PromptInputSubmit
            disabled={isProcessing ? false : !input}
            status={isProcessing ? "streaming" : undefined}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
};
