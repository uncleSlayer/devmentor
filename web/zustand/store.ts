import { create } from 'zustand'

interface ConversationState {
    conversations: {
        id: string,
        title: string,
        chat: {
            question: {
                id: string,
                question: string,
            },
            answer: {
                id: string,
                answer: string,
                code_snippet: string,
                code_language: string
            }
        }[]
    }[]
    addConversation: (conversation: {
        id: string,
        title: string,
        chat: {
            question: {
                id: string,
                question: string
            },
            answer: {
                id: string,
                answer: string,
                code_snippet: string,
                code_language: string
            }
        }[]
    }) => void
}

export const useConversationStore = create<ConversationState>()((set) => ({
    conversations: [],
    addConversation: (conversation) => {
        set((state) => ({
            conversations: [...state.conversations, conversation]
        }))
    }
}))
