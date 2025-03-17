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
            },
            youtube_video_suggestions: string[]
        }[]
    }[],
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
            },
            youtube_video_suggestions: string[]
        }[]
    }) => void,
    addPlaceHolderMessageToAnExistingConversation: (conversationId: string, question: string) => void,
    addContinuationMessageToAnExistingConversation: (conversationId: string, continuationMessageInfo: {
        questionInfo: {
            id: string,
            question: string
        },
        answerInfo: {
            id: string,
            answer: string,
            code_snippet: string,
            code_language: string
        },
        youtube_video_suggestions: string[]
    }) => void,
}

export const useConversationStore = create<ConversationState>()((set) => ({
    conversations: [],
    addConversation: (conversation) => {
        set((state) => ({
            conversations: [...state.conversations, conversation]
        }))
    },
    addPlaceHolderMessageToAnExistingConversation: (conversationId, question) => {
        set((state) => {
            const conversation = state.conversations.find((cv) => cv.id === conversationId)
            if (!conversation) {
                return state
            }
            const updatedChat = [
                ...conversation.chat,
                {
                    question: {
                        id: "placeholder",
                        question
                    },
                    answer: {
                        id: "placeholder",
                        answer: 'Thinking...',
                        code_snippet: 'None',
                        code_language: 'Python'
                    },
                    youtube_video_suggestions: []
                }
            ]
            const updatedConversations = state.conversations.map((cv) =>
                cv.id === conversationId ? { ...cv, chat: updatedChat } : cv
            )
            return {
                conversations: updatedConversations
            }
        })
    },
    addContinuationMessageToAnExistingConversation: (conversationId, continuationMessageInfo) => {
        set((state) => {
            const conversation = state.conversations.find((cv) => cv.id === conversationId)
            if (!conversation) {
                return state
            }
            const updatedChat = [
                ...conversation.chat.filter((chat) => chat.question.id !== 'placeholder'),
                {
                    question: continuationMessageInfo.questionInfo,
                    answer: continuationMessageInfo.answerInfo,
                    youtube_video_suggestions: continuationMessageInfo.youtube_video_suggestions
                }
            ]
            const updatedConversations = state.conversations.map((cv) =>
                cv.id === conversationId ? { ...cv, chat: updatedChat } : cv
            )
            return {
                conversations: updatedConversations
            }
        })
    }
}))
