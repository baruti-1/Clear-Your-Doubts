import { Configuration, OpenAIApi } from "openai";
import { process } from "./env";

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const chatbotConversation = document.getElementById("chatbot-conversation");

const conversationArray = [
  {
    role: "system",
    content:
      "You are a highly knowledgeable assistant that is always happy to help.",
  },
];

const firebaseConfig = {
  projectId: "clear-your-doubts-18eb5",
  databasebURL: "https://clear-your-doubts-18eb5-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const conversationDb = ref(database);

document.addEventListener("submit", (e) => {
  e.preventDefault();
  const userInput = document.getElementById("user-input");

  push(conversationDb, {
    role: "user",
    content: userInput.value,
  });

  fetchReply();

  const newSpeechBubble = document.createElement("div");
  newSpeechBubble.classList.add("speech", "speech-human");
  chatbotConversation.appendChild(newSpeechBubble);
  newSpeechBubble.textContent = userInput.value;
  userInput.value = "";
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
});

const fetchReply = async () => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: conversationArray,
    presence_penalty: 0,
    frequency_penalty: 0.3,
  });
  renderTypewriterText(response.data.choices[0].message.content);
  conversationArray.push(response.data.choices[0].message);
};

function renderTypewriterText(text) {
  const newSpeechBubble = document.createElement("div");
  newSpeechBubble.classList.add("speech", "speech-ai", "blinking-cursor");
  chatbotConversation.appendChild(newSpeechBubble);
  let i = 0;
  const interval = setInterval(() => {
    newSpeechBubble.textContent += text.slice(i - 1, i);
    if (text.length === i) {
      clearInterval(interval);
      newSpeechBubble.classList.remove("blinking-cursor");
    }
    i++;
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
  }, 50);
}
