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

  useEffect(() => {
    const initialMessage = {
      response:
        "Are you registered as a supplier? Remember that only registration is required to be visible in GEB and its Affiliates.\n\n1. Yes.\n2. No.\n3. I am not sure.",
    };
    setChatHistory([initialMessage]);
  }, []);

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

    if (Prompt || transcript) {
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
      setPrompt("");

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
              // Update the chat history with the success message
              newChatHistory = newChatHistory.map((chat, index) =>
                index === newChatHistory.length - 1
                  ? {
                      ...chat,
                      response: `What would you like to do?\n\n1. Update registration.\n\n2. Apply to prequalify your company (In this option you can postulate the goods or services offered by your company to be preselected).\n\n3. Other inquiries.`,
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

          if (functionCall.name === "get_No") {
            // Assuming the function call is to send an email
            try {
              // Update the chat history with the success message
              newChatHistory = newChatHistory.map((chat, index) =>
                index === newChatHistory.length - 1
                  ? {
                      ...chat,
                      response: `Please continue with the registry. To be part of the GEB suppliers, please complete the registration through the following link:\n\nhttps://www.grupoenergiabogota.com/conoce-geb/proveedores-y-contratistas/registro-de-proveedores`,
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

          if (functionCall.name === "get_Not_sure") {
            // Assuming the function call is to send an email
            try {
              // Update the chat history with the success message
              newChatHistory = newChatHistory.map((chat, index) =>
                index === newChatHistory.length - 1
                  ? {
                      ...chat,
                      response: `Please verify your registration. To verify if you are not registered as a supplier, please fill out the following form:\n\n`,
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

          if (functionCall.name === "update_registration") {
            // Assuming the function call is to send an email
            try {
              // Update the chat history with the success message
              newChatHistory = newChatHistory.map((chat, index) =>
                index === newChatHistory.length - 1
                  ? {
                      ...chat,
                      response: `To update your registration, you must log in to the vendor area by clicking on 'Access Proposals and Questions' on our GEB portal in the 'Registry of Providers' section.\n\nhttps://service.ariba.com/Supplier.aw/109534059/aw?awh=r&awssk=Q9NZuXEk&dard=1&ancdc=1`,
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

          if (functionCall.name === "pre_qualify_company") {
            // Assuming the function call is to send an email
            try {
              // Update the chat history with the success message
              newChatHistory = newChatHistory.map((chat, index) =>
                index === newChatHistory.length - 1
                  ? {
                      ...chat,
                      response: `Consult the document of available categories for prequalification, validate the applicability, and confirm that you have the category in the registry.\n\nhttps://www.grupoenergiabogota.com/es/servicios/registro-de-proveedores\n🧾\n\n1. Yes, I am registered for pre qualify.\n2. No, I am not registered for pre qualify.\n3. I am not sure.`,
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

          if (functionCall.name === "registered_pre_qualify") {
            // Assuming the function call is to send an email
            try {
              // Update the chat history with the success message
              newChatHistory = newChatHistory.map((chat, index) =>
                index === newChatHistory.length - 1
                  ? {
                      ...chat,
                      response: `Express your intention to prequalify in a category of goods or services by filling out the following form:\n\nhttps://forms.office.com/Pages/ResponsePage.aspx?id=MeSd1MKOJ0aV3KGwQburMIMfVQVpFRlNsCstqy_tRmBUMFRZRkxGMFcyNTNQV0tCUTlKQzlTWjcxUi4u`,
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
    }
  };

  return (
    <div className={styles.ChatAssistants}>
      <div className={styles.chatHistory}>
        {chatHistory.map((chat, index) => {
          return (
            <div className={styles.chatQuery} key={index}>
              {chat.prompt && (
                <div className={styles.userText}>
                  <p>{chat.prompt}</p>
                </div>
              )}

              <div className={styles.aiText}>
                <p>
                  {(chat.response && chat.response) ||
                    (isAITyping && "typing...")}
                </p>
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
