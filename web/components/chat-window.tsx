"use client"

import React from 'react'
import { ChatBubble } from './ui/chat-bubble'
import { User, Bot } from 'lucide-react'
import { useConversationStore } from '@/zustand/store'

const ChatWindow = ({
    conversationId
}: {
    conversationId: string
}) => {

    const { conversations } = useConversationStore()

    const conversationDetails = conversations.find((cv) => cv.id === conversationId)

    const chats = conversationDetails?.chat

    return (
        <div>
            <div className="flex flex-col gap-4 p-4">
                {
                    chats?.map((chat, index) => {

                        const { question, answer } = chat

                        return (<>
                            <ChatBubble
                                message={question.question}
                                sender="user"
                                timestamp="10:30 AM"
                                avatar={<User className="h-4 w-4" />}
                            />
                            <ChatBubble
                                message={answer.answer}
                                sender="bot"
                                timestamp="10:30 AM"
                                avatar={<Bot className="h-4 w-4" />}
                            />
                        </>)
                    })
                } 
            </div>
        </div>
    )
}

export default ChatWindow