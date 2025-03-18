"use client"

import React from 'react'
import { Input } from './ui/input'
// import { Button } from './ui/button'
import { SendIcon } from 'lucide-react'
import axios from 'axios'
import { SERVER_URL } from '@/config'
import { useRouter } from 'next/navigation'
import { useConversationStore } from '@/zustand/store'
import { toast } from "sonner"

const TextInput = ({

    newConversation,
    setNewConversationQuestion,

    continuationOfConversation,
    conversationId

}: {

    newConversation?: boolean,
    setNewConversationQuestion?: React.Dispatch<React.SetStateAction<string>>,

    continuationOfConversation?: boolean,
    conversationId?: string,

}) => {

    const { addConversation, addPlaceHolderMessageToAnExistingConversation, addContinuationMessageToAnExistingConversation } = useConversationStore()

    const router = useRouter()

    const [messageInputText, setMessageInputText] = React.useState('')

    const handleSendButtonClick = async () => {

        if (messageInputText.trim() === '') {
            return
        }

        if (newConversation && setNewConversationQuestion) {
            setNewConversationQuestion(messageInputText)

            const response = await axios.post(`${SERVER_URL}/conversation`, {
                question: messageInputText
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })

            if (response.status === 200) {

                const { conversation, ai_answer, question_info }: {
                    conversation: { conversation_id: string, title: string },
                    question_info: { question_id: string, question: string, author_id: string },
                    ai_answer: { answer_id: string, answer: string, code_snippet: string, code_language: string, youtube_suggestions: {
                        ai_answer_id: string,
                        suggestion_type: string,
                        url: string,
                        title: string,
                        id: string
                    }[] }
                } = response.data 

                addConversation({
                    id: conversation.conversation_id,
                    title: conversation.title,
                    chat: [
                        {
                            question: {
                                id: question_info.question_id,
                                question: question_info.question
                            },
                            answer: {
                                id: ai_answer.answer_id,
                                answer: ai_answer.answer,
                                code_snippet: ai_answer.code_snippet,
                                code_language: ai_answer.code_language,
                                youtube_video_suggestions: ai_answer.youtube_suggestions.map((youtube_suggestion) => ({
                                    aiAnswerId: youtube_suggestion.ai_answer_id,
                                    url: youtube_suggestion.url,
                                    youtubeSuggestionId: youtube_suggestion.id
                                }))
                            }
                        }
                    ]
                })

                router.push(`/conversation/${conversation.conversation_id}`)

            } else {
                setMessageInputText("I could not think of a solution to your problem. Please try with a different question.")
                console.error('Failed to send message')
            }
        }

        if (continuationOfConversation && conversationId) {

            addPlaceHolderMessageToAnExistingConversation(conversationId, messageInputText)
            setMessageInputText('')

            // first we will add a placeholder message to the chat,
            // then we will make an api call to the server to get the next question and answer
            // and then we will add the new question and answer to the redux state

            // Before making the api call, we will add the placeholder message to the chat

            const response = await axios.post(`${SERVER_URL}/chat/continue/${conversationId}`, {
                question: messageInputText
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })

            if (response.status !== 200) {

                toast.error("Something went wrong. Please try again later with a different question.")

            } else { 

                addContinuationMessageToAnExistingConversation(conversationId, {
                    questionInfo: {
                        id: response.data.answer.user_question_info.question_id,
                        question: response.data.answer.user_question_info.question
                    },
                    answerInfo: {
                        id: response.data.answer.answer_info.answer_id,
                        answer: response.data.answer.answer_info.answer,
                        code_snippet: response.data.answer.answer_info.code_snippet,
                        code_language: response.data.answer.answer_info.code_language,
                        youtube_video_suggestions: response.data.answer.answer_info.youtube_suggestions.map((youtube_video_suggestion: {
                            ai_answer_id: string,
                            suggestion_type: string,
                            url: string,
                            title: string,
                            id: string
                        }) => ({
                            aiAnswerId: youtube_video_suggestion.ai_answer_id,
                            url: youtube_video_suggestion.url,
                            youtubeSuggestionId: youtube_video_suggestion.id
                        }))
                    }
                })

            }
        }

    }

    return (
        <div className='flex items-center justify-center gap-3'>
            <Input className='bg-white text-black placeholder:text-black placeholder:text-muted-foreground border-0 shadow-none focus-visible:ring-0' value={messageInputText} onChange={(e) => { setMessageInputText(e.target.value) }} placeholder='Write a python function to print a circle using * and # characters' />
            <div className='rounded-full bg-white p-2 hover:scale-105 cursor-pointer'>
                <SendIcon onClick={handleSendButtonClick} size={20} fill='black' color='black' />
            </div>
        </div>
    )
}

export default TextInput