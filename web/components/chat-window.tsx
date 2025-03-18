"use client"

import React from 'react'
import { ChatBubble } from './ui/chat-bubble'
import { User, Bot } from 'lucide-react'
import { useConversationStore } from '@/zustand/store'
import axios from 'axios'
import { env } from '@/config/env'
import Link from 'next/link'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from './ui/button'
import CodeRenderer from './ui/code-renderer'

const ChatWindow = ({
    conversationId
}: {
    conversationId: string
}) => {

    const { conversations, addConversation } = useConversationStore()

    const conversationDetails = conversations.find((cv) => cv.id === conversationId)

    const chats = conversationDetails?.chat

    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
    const [codeRunnerResponse, setCodeRunnerResponse] = React.useState<null | string>(null)

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
                                code_language: string,
                                youtube_suggestions: {
                                    ai_answer_id: string,
                                    suggestion_type: string,
                                    url: string,
                                    title: string,
                                    id: string
                                }[]
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
                                code_language: answer.code_language,
                                youtube_video_suggestions: answer.youtube_suggestions.map((youtube_suggestion) => ({
                                    aiAnswerId: youtube_suggestion.ai_answer_id,
                                    url: youtube_suggestion.url,
                                    youtubeSuggestionId: youtube_suggestion.id
                                }))
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
                                setDrawerOpen={setIsDrawerOpen}
                                setCodeRunnerResponse={setCodeRunnerResponse}
                                answerId={answer.id}
                            />
                            <div className='ml-14'>
                                <span className='text-xs text-slate-700'>Youtube Video Suggestions: </span>
                                <div className='flex gap-4 items-center'>
                                    {
                                        answer.youtube_video_suggestions && answer.youtube_video_suggestions.map((yt_suggestion, index) => {

                                            const indexOfPattern = yt_suggestion.url.indexOf("?v=")

                                            const videoId = yt_suggestion.url.substring(indexOfPattern + 3, indexOfPattern + 3 + 11)

                                            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`

                                            return (
                                                <Link href={yt_suggestion.url} target='_blank' className='cursor-pointer' key={index}>
                                                    <div className='w-52 h-32 rounded-lg overflow-hidden'>
                                                        {
                                                            <img className='object-cover w-full h-full' src={thumbnailUrl} alt="Youtube video" />
                                                        }
                                                    </div>
                                                </Link>

                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>)
                    })
                }
            </div>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Running the code.</DrawerTitle>
                        <DrawerDescription>We run the code in an isolated docker container in our servers.</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        {
                            !codeRunnerResponse && <span>Running the code, Please wait...</span>
                        }
                        {
                            codeRunnerResponse && <CodeRenderer text={codeRunnerResponse} />
                        }
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

        </div>
    )
}

export default ChatWindow