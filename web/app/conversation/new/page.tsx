"use client"

import TextInput from '@/components/text-input'
import { ChatBubble } from '@/components/ui/chat-bubble'
import Image from 'next/image'
import React from 'react'
import { User, Bot } from 'lucide-react'

const page = () => {

    const [question, setQuestion] = React.useState('')

    return (
        <div className='flex h-full flex-col justify-between gap-4'>
            <div>
                {
                    question.length > 0 && <ChatBubble
                        message={question}
                        sender="user"
                        timestamp="10:30 AM"
                        avatar={<User className="h-4 w-4" />}
                    />
                }
                {
                    question.length > 0 && <ChatBubble
                        message="Thinking..."
                        sender="bot"
                        timestamp="10:30 AM"
                        avatar={<Bot className="h-4 w-4" />}
                    />
                }
            </div>
            {
                question.length === 0 && <Image className='w-full h-[95%] object-cover rounded-lg' src='/create_conversation.webp' alt='create new conversation' width={1000} height={1000} />
            }
            {/* <Image className='w-full h-[95%] object-cover rounded-lg' src='/create_conversation.webp' alt='create new conversation' width={1000} height={1000} /> */}
            <TextInput newConversation={true} setNewConversationQuestion={setQuestion} />
        </div>
    )
}

export default page