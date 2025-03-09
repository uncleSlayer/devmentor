import React from 'react'
import { ChatBubble } from './ui/chat-bubble'
import { User, Bot } from 'lucide-react'

const ChatWindow = () => {
    return (
        <div>
            <div className="flex flex-col gap-4 p-4">
                <ChatBubble
                    message="Hello! How can I help you today?"
                    sender="bot"
                    timestamp="10:30 AM"
                    avatar={<Bot className="h-4 w-4" />}
                />

                <ChatBubble
                    message="I'm looking for information about your services."
                    sender="user"
                    timestamp="10:31 AM"
                    avatar={<User className="h-4 w-4" />}
                />

                <ChatBubble
                    message="Of course! We offer a wide range of services including web development, design, and consulting."
                    sender="bot"
                    timestamp="10:32 AM"
                    avatar={<Bot className="h-4 w-4" />}
                />
            </div>
        </div>
    )
}

export default ChatWindow