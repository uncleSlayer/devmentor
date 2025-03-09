import TextInput from '@/components/text-input'
import Image from 'next/image'
import React from 'react'

const page = () => {
    return (
        <div className='flex h-full flex-col justify-between gap-4'>
            <Image className='w-full h-[95%] object-cover rounded-lg' src='/create_conversation.webp' alt='create new conversation' width={1000} height={1000} />
            <TextInput />
        </div>
    )
}

export default page