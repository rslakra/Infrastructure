from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI

from core.config import Config


class LLMService:
    def __init__(self, vector_store):
        self.llm = ChatOpenAI(
            temperature=0.7,
            model="gpt-3.5-turbo",
            api_key=Config.OPENAI_API_KEY,
        )
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
        )
        self.chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=vector_store.vector_store.as_retriever(),
            memory=self.memory,
        )

    def get_response(self, query):
        try:
            response = self.chain.invoke({"question": query})
            return response["answer"]
        except Exception as e:
            print(f"Error getting LLM response: {e}")
            return "I encountered an error processing your request."
