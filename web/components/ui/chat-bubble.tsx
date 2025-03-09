"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import CodeRenderer from "./code-renderer";


interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  sender?: "user" | "bot"
  timestamp?: string
  avatar?: React.ReactNode
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ message, sender = "user", timestamp, avatar, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full gap-2",
          sender === "user" ? "justify-end" : "justify-start",
          className
        )}
        {...props}
      >
        {sender === "bot" && avatar && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-muted">
            {avatar}
          </div>
        )}
        <div
          className={cn(
            "max-w-[80%] rounded-lg px-4 py-2",
            sender === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          <CodeRenderer text={message} />
          {/* <p className="text-sm">{message}</p> */}
          {timestamp && (
            <time className={cn(
              "mt-1 block text-xs opacity-70",
              sender === "user" ? "text-right" : "text-left"
            )}>
              {timestamp}
            </time>
          )}
        </div>
        {sender === "user" && avatar && (
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-muted">
            {avatar}
          </div>
        )}
      </div>
    )
  }
)
ChatBubble.displayName = "ChatBubble"

export { ChatBubble }