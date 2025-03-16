'use client'

import ChatWindow from '@/components/chat-window'
import { ScrollArea } from "@/components/ui/scroll-area"
import TextInput from '@/components/text-input'
import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {

  const { id } = useParams<{ id: string }>()

  return (
    <div className='flex h-full flex-col justify-between gap-4'>
      <ScrollArea className='w-full h-[95%] rounded-lg'>
        <ChatWindow conversationId={id} />
      </ScrollArea>
      <TextInput conversationId={id} continuationOfConversation={true} />
    </div>
  )
}

export default page