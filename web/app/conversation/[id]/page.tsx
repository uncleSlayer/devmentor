'use client'

import ChatWindow from '@/components/chat-window'
import TextInput from '@/components/text-input'
import { useParams } from 'next/navigation'
import React from 'react'

const Page = () => {

  const { id } = useParams<{ id: string }>()

  return (
    <div className='flex h-full flex-col justify-between gap-4'>
      <div className='w-full h-[95%] overflow-y-scroll rounded-lg'>
        <ChatWindow conversationId={id} />
      </div>
      <TextInput conversationId={id} continuationOfConversation={true} />
    </div>
  )
}

export default Page