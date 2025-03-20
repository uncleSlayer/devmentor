from langgraph.graph import StateGraph
from src.langgraph.state import SingleQuestionChatState
from src.ai import llm, retriver
from src.langgraph.tools import youtube_search_tool
import ast

single_question_chat_graph = StateGraph(SingleQuestionChatState)


class SingleQuestionGraph:


    def prompt_sanitation(state):
        """
        This function is called when the user asks a question.
        It sanitizes the question by removing any bad words and punctuations or anything that might cause issues.
        The sanitized question is then stored in the langgraph state.
        """   

        question = state["question"]

        question_modified_for_prompt_sanitation = llm.invoke(f"""
            
        """)


    def generate_youtube_suggestions(state):

        """
        This function uses a tool to generate youtube suggestions based on the question.
        The tool takes the question as input and returns a list of youtube video ids.
        """

        question = state["question"]

        question_modified_for_youtube_search_query = llm.invoke(f"""
            You are a helpful assistant that modifies the question to be used in a youtube search query.
            Convert the question into a short youtube search query.
                                                                
            Strict rule 
            1. If the question is not related to computer science, reply with "None".
            2. If the question is related to computer science, reply with the youtube search query. No quotes, nothing other than the query itself, just the query for example - How to write binary search in python?

            Question: "{question}"
        """).content
 
        if question_modified_for_youtube_search_query == "None":
            return state
        
        else:
            
            youtube_suggestions = youtube_search_tool.run(question_modified_for_youtube_search_query)

            state["youtube_suggestions"] = ast.literal_eval(youtube_suggestions)

            return state

    def generate_answer(state):
        """
        This function is called when the user asks a question.
        It retrieves the relevant documents from the vector store and passes them to the LLM.
        The LLM generates an answer based on the question and the retrieved documents.
        The answer is then stored in the langgraph state.
        """

        question = state["question"]

        # retrived_documents = retriver.invoke(question)

        answer = llm.invoke(
            f"""
            You are a helpful assistant that answers questions based on the provided context.
            If you don't know the answer, reply with "I don't know the answer to this question". Don't try to make up an answer.
            If the user asks for code, write all the code in one code block. Don't write code that can't be run in a basic python repl.
            Your code example will be ran in a docker container of a python repl.

            Question: "{question}"
        """
        )

        state["answer"] = dict(answer).get("content")

        if state["answer"] == "I don't know the answer to this question":

            if state["youtube_suggestions"]:
                state["answer"] = "I don't have relevant information to answer this question, however, I am attaching some youtube videos that might help you with your question."
            else:
                state["answer"] = "We can't answer this question. Please ask a different question."

        return state

    def generate_code_block(state):
        """
        This function is called when the user asks for code.
        It goes through the langgraph state and extracts the answer out of it.
        It then parses out the code block from the answer.
        The code block is then passed to the LLM to make it properly formatted.
        The formatted code block is then stored in the langgraph state.
        """

        answer = state["answer"]

        code_block = llm.invoke(
            f"""

            You are a helpful assistant that parses out the code block from the input.
            The input answer given to you is geneated by an ai assistant.
            Your job is to parse out the code block from the answer. You are also responsible for the overall code quality.
            You can change the code block to be more readable and better formatted and if the code can not be run in a basic python repl, 
            you change the code block to be a valid python code block.
            The code must be so that it can be run in a basic python repl.
            If you think the input doesn't have a code block, you return "None".
            Your output must not contain anything other than the code block.

            Answer generated by the ai assistant:
            {answer}
        """
        )

        state["code_block"] = code_block.content

        return state

single_question_chat_graph.add_node(
    "generate_answer", SingleQuestionGraph.generate_answer
)

single_question_chat_graph.add_node(
    "generate_code_block", SingleQuestionGraph.generate_code_block
)

single_question_chat_graph.add_node(
    "generate_youtube_suggestions", SingleQuestionGraph.generate_youtube_suggestions
)

single_question_chat_graph.add_edge("generate_youtube_suggestions", "generate_answer")

single_question_chat_graph.add_edge("generate_answer", "generate_code_block")

single_question_chat_graph.set_entry_point("generate_youtube_suggestions")

runner = single_question_chat_graph.compile({})


def generate_answer(question: str):
    return runner.invoke({"question": question, "answer": "", "code_block": "", "youtube_suggestions": []})
