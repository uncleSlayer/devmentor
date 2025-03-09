import ChatWindow from '@/components/chat-window'
import TextInput from '@/components/text-input'
import React from 'react'

const page = ({
  params: { id }
}: {
  params: { id: string }
}) => {
  return (
    <div className='flex h-full flex-col justify-between gap-4'>
      <div className='w-full h-[95%] rounded-lg'>
        <ChatWindow conversationId={id} />
      </div>
      <TextInput />
    </div>
  )
}

export default page