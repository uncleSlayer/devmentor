"use client"

import React from 'react'
import { ChatBubble } from './ui/chat-bubble'
import { User, Bot } from 'lucide-react'
import { useConversationStore } from '@/zustand/store'
import axios from 'axios'
import { env } from '@/config/env'

const ChatWindow = ({
    conversationId
}: {
    conversationId: string
}) => {

    const { conversations, addConversation } = useConversationStore()

    const conversationDetails = conversations.find((cv) => cv.id === conversationId)

    const chats = conversationDetails?.chat
    
    if (!chats) {

        const getChatsFromServer = async () => {
            
            try {
                
                const response = await axios.get(`${env.SERVER_URL}/chat/${conversationId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                })
                
                if (response.status !== 200) {

                    console.error('Error fetching chats from server:', response.statusText)

                } else {

                    const { conversation, user_queries } = response.data

                    addConversation({
                        id: conversation.conversation_id,
                        title: conversation.title,
                        chat: user_queries.map(({ question, answer }: {
                            question: {
                                question_id: string,
                                question: string
                            },
                            answer: {
                                answer_id: string,
                                answer: string,
                                code_snippet: string,
                                code_language: string
                            }
                        }) => ({
                            question: {
                                id: question.question_id,
                                question: question.question
                            },
                            answer: {
                                id: answer.answer_id,
                                answer: answer.answer,
                                code_snippet: answer.code_snippet,
                                code_language: answer.code_language
                            }
                        }))
                    })

                }

            } catch (error) {

                console.error('Error fetching chats from server:', error)
            
            }

        }

        getChatsFromServer()

    }

    return (
        <div> 
            <div className="flex flex-col gap-4 p-4">
                {
                    chats?.map((chat, index) => {

                        const { question, answer } = chat

                        return (<div key={index}>
                            <ChatBubble
                                message={question.question}
                                sender="user"
                                avatar={<User className="h-4 w-4" />}
                            />
                            <ChatBubble
                                message={answer.answer}
                                sender="bot"
                                avatar={<Bot className="h-4 w-4" />}
                            />
                        </div>)
                    })
                } 
            </div>
        </div>
    )
}

export default ChatWindow