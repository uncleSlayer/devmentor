"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import CodeRenderer from "./code-renderer";
import { Button } from "./button";
import { Play } from "lucide-react"
import axios from "axios";
import { SERVER_URL } from "@/config";

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
  sender?: "user" | "bot"
  timestamp?: string
  avatar?: React.ReactNode,
  answerId?: string,
  setDrawerOpen?: React.Dispatch<React.SetStateAction<boolean>>
  setCodeRunnerResponse?: React.Dispatch<React.SetStateAction<null | string>>
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ message, sender = "user", timestamp, avatar, className, answerId, setCodeRunnerResponse, setDrawerOpen, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full gap-2 m-4 relative",
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
        {sender === "bot" && (
          <div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 rounded-full bg-primary/10 hover:bg-primary/20"
              onClick={async () => {
                if (setDrawerOpen) {

                  setDrawerOpen(true)

                  const response = await axios(`${SERVER_URL}/run/${answerId}`, {
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    withCredentials: true
                  })

                  const { code_output }: { code_output: string } = response.data
                  if (setCodeRunnerResponse) {
                    setCodeRunnerResponse(code_output)
                  }

                }
              }}
              title="Run code"
            >
              <Play className="h-3 w-3" />
              <span className="sr-only">Run code</span>
            </Button>
          </div>
        )}
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