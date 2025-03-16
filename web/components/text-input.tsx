"use client"

import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
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

                // response format:
                // {
                //     "answer": {
                //         "answer_info": {
                //             "answer_id": "aee608a2-460c-4231-80d3-97b3de04e98f",
                //             "answer": "Generator functions in Python are functions that use the `yield` keyword to return a value and pause the function's execution, allowing it to be resumed later. When a generator function is called, it returns a generator object without actually running the function. The generator object can then be iterated over using a `for` loop or by calling the `next()` function.\n\nHere is an example of a simple generator function that yields values from 0 to n:\n\n```python\ndef my_generator(n):\n    for i in range(n):\n        yield i\n\n# Using the generator function\ngen = my_generator(5)\nfor value in gen:\n    print(value)\n```\n\nWhen the `my_generator` function is called with an argument of 5, it returns a generator object. The `for` loop then iterates over the generator object, calling `next()` behind the scenes to retrieve each yielded value.\n\nGenerator functions are useful for generating large sequences of values without storing them all in memory at once. They are memory efficient and can be more performant than using lists or other data structures for generating sequences.",
                //             "code_snippet": "```python\ndef my_generator(n):\n    for i in range(n):\n        yield i\n\n# Using the generator function\ngen = my_generator(5)\nfor value in gen:\n    print(value)\n```",
                //             "code_language": "python"
                //         },
                //         "user_question_info": {
                //             "question_id": "bf922fae-5e17-4036-9b27-6e7b0bddfd85",
                //             "question": "Explain me how generator functions work in python",
                //             "author_id": "8911624e-597a-41ad-8996-a15f6261852e"
                //         }
                //     }
                // }

                addContinuationMessageToAnExistingConversation(conversationId, {
                    questionInfo: {
                        id: response.data.answer.user_question_info.question_id,
                        question: response.data.answer.user_question_info.question
                    },
                    answerInfo: {
                        id: response.data.answer.answer_info.answer_id,
                        answer: response.data.answer.answer_info.answer,
                        code_snippet: response.data.answer.answer_info.code_snippet,
                        code_language: response.data.answer.answer_info.code_language
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