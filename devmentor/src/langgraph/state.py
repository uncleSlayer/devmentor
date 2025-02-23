from typing_extensions import TypedDict


class SingleQuestionChatState(TypedDict):
    question: str
    answer: str
    code_block: str
