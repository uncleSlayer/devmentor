"use client"

import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { SendIcon } from 'lucide-react'
import axios from 'axios'
import { SERVER_URL } from '@/config'
import { useRouter } from 'next/navigation'
import { useConversationStore } from '@/zustand/store'

const TextInput = ({

    newConversation,
    newConversationQuestion,

    setNewConversationQuestion

}: {

    newConversation?: boolean,
    newConversationQuestion?: string,

    setNewConversationQuestion?: React.Dispatch<React.SetStateAction<string>>

}) => {

    const { addConversation } = useConversationStore()

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
                    ai_answer: { answer_id: string, answer: string, code_snippet: string, code_language: string }
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
                                code_language: ai_answer.code_language
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