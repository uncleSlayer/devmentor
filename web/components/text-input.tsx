"use client"

import React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { SendIcon } from 'lucide-react'
import axios from 'axios'
import { SERVER_URL } from '@/config'
import { useRouter } from 'next/navigation'

const TextInput = () => {

    const router = useRouter()

    const [messageInputText, setMessageInputText] = React.useState('')

    const handleSendButtonClick = async () => {

        if (messageInputText.trim() === '') {
            return
        }

        const response = await axios.post(`${SERVER_URL}/conversation`, {
            question: messageInputText
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })

        if (response.status === 200) {

            const { conversation }: { conversation: { conversation_id: string } } = response.data

            router.push(`/conversation/${conversation.conversation_id}`)

        } else {
            console.error('Failed to send message')
        }

    }

    return (
        <div className='flex items-center justify-center gap-3'>
            <Input className='bg-white text-black placeholder:text-black border-0 shadow-none focus-visible:ring-0' value={messageInputText} onChange={(e) => setMessageInputText(e.target.value)} placeholder='Type your message here...' />
            <div className='rounded-full bg-white p-2 hover:scale-105 cursor-pointer'>
                <SendIcon onClick={handleSendButtonClick} size={20} fill='black' color='black' />
            </div>
        </div>
    )
}

export default TextInput