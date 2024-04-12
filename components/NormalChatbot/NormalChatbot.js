"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./NormalChatbot.module.scss";
import axios from "../../axios/api";
import { FaMicrophoneAlt } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

const NormalChatbot = () => {
  const [Prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAITyping, setIsAITyping] = useState(false);

  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  // Training the chat model with custom instructions to interact with the user in a specific way based on the use case.

  const systemMessage = {
    role: "system",
    content: `You are a chatbot for Supplier Management of Grupo Energía Bogotá and Affiliates and you answer to user's questions not more than 40 words (use emojis). Do not tell them about function calling, just do it in the background if required.`,
  };

  const [conversationHistory, setConversationHistory] = useState([
    systemMessage,
  ]);

  // Training the chat model with custom instructions to interact with the user in a specific way based on the use case.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAITyping]);

  const startSpeechRecognition = async (e) => {
    recognition.current = new window.webkitSpeechRecognition();
    recognition.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSubmit(e, transcript);
    };

    recognition.current.start();
  };

  const handleSubmit = async (e, transcript) => {
    e.preventDefault();
    const userMessage = {
      role: "user",
      content: transcript ? transcript : Prompt,
    };

    const updatedHistory = [...conversationHistory, userMessage];
    setConversationHistory(updatedHistory);

    const mesId = uuidv4();

    // Update chat history with user prompt immediately
    let newChatHistory = [
      ...chatHistory,
      {
        prompt: transcript ? transcript : Prompt,
        response: "",
      },
    ];
    setChatHistory(newChatHistory);
    setIsAITyping(true);

    try {
      const chatsData = {
        prompt: transcript ? transcript : Prompt,
        conversationHistory: conversationHistory,
      };

      const res = await axios.post("chats", chatsData);
      const data = res.data;
      console.log(data);
      // Check for function_call in the response
      if (data?.function_call) {
        console.log("function calling");
        const functionCall = data.function_call;

        console.log("functionCall", functionCall);

        if (functionCall.name === "get_Yes") {
          // Assuming the function call is to send an email
          try {
            const functionArguments = JSON.parse(functionCall.arguments);
            // const { query } = functionArguments;

            // Update the chat history with the success message
            newChatHistory = newChatHistory.map((chat, index) =>
              index === newChatHistory.length - 1
                ? {
                    ...chat,
                    response: `Are you registered in http://localhost:3000/ associated category?\n1. Yes, I am registered.\n2. No, I am not registered.\n3. I am not sure.`,
                  }
                : chat
            );
          } catch (error) {
            console.error(error);

            newChatHistory = newChatHistory.map((chat, index) =>
              index === newChatHistory.length - 1
                ? {
                    ...chat,
                    response: `Please try again`,
                  }
                : chat
            );
          }
        }
      } else {
        // Update chat history with AI response
        newChatHistory[newChatHistory.length - 1].response = data.content;
      }

      setChatHistory(newChatHistory);
      setIsAITyping(false); // AI stops 'typing'
    } catch (error) {
      console.error(error);
      setIsAITyping(false); // In case of an error, AI stops 'typing'
    }

    setPrompt(""); // Clear the input after submitting
  };

  return (
    <div className={styles.ChatAssistants}>
      <div className={styles.chatHistory}>
        {chatHistory.map((chat, index) => {
          return (
            <div className={styles.chatQuery} key={index}>
              <div className={styles.userText}>
                <p>{chat.prompt}</p>
              </div>

              <div className={styles.aiText}>
                <p>{chat.response || (isAITyping && "typing...")}</p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.chatForm}>
        <FaMicrophoneAlt onClick={startSpeechRecognition} />
        <input
          value={Prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
          type="text"
          placeholder="Ask something..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default NormalChatbot;
