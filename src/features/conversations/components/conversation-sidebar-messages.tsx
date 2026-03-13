import { CopyIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";

import { Doc } from "../../../../convex/_generated/dataModel";

interface ConversationSidebarMessagesProps {
  conversationMessages: Doc<"messages">[] | undefined;
}

export const ConversationSidebarMessages = ({
  conversationMessages,
}: ConversationSidebarMessagesProps) => {
  return (
    <Conversation className="flex-1">
      <ConversationContent>
        {conversationMessages?.map((message, messageIndex) => (
          <Message key={message._id} from={message.role}>
            <MessageContent>
              {message.status === "processing" ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <LoaderIcon className="size-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              ) : message.status === "cancelled" ? (
                <span className="text-muted-foreground italic">
                  This message is cancelled before completed. Please try again.
                </span>
              ) : (
                <MessageResponse>{message.content}</MessageResponse>
              )}
            </MessageContent>
            {message.role === "assistant" &&
              message.status === "completed" &&
              messageIndex === (conversationMessages?.length ?? 0) - 1 && (
                <MessageActions>
                  <MessageAction
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      toast.success("Copied")
                    }}
                    label="Copy"
                  >
                    <CopyIcon className="size-3" />
                  </MessageAction>
                </MessageActions>
              )}
          </Message>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
};
