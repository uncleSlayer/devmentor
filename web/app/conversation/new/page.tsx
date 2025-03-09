import TextInput from '@/components/text-input'
import React from 'react'

const page = () => {
    return (
        <div className='bg-slate-200 absolute left-0 right-0 top-5 bottom-0 m-4 rounded-lg p-4 flex flex-col justify-between'>
            <h1>New conversation</h1>
            <div className='bg-slate-500 w-3/4 mx-auto rounded-lg p-4'>
                <TextInput />
            </div>
        </div>
    )
}

export default page