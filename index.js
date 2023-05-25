import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get, remove } from "firebase/database";

const chatbotConversation = document.getElementById("chatbot-conversation");

const instructionObj = {
  role: "system",
  content: "You are a helpful assistant.",
};

const firebaseConfig = {
  projectId: "clear-your-doubts-18eb5",
  databasebURL: "https://clear-your-doubts-18eb5-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const conversationDb = ref(database);

const userInput = document.getElementById("user-input");

document.addEventListener("submit", (e) => {
  e.preventDefault();

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
  const url =
    "https://reliable-panda-477942.netlify.app/.netlify/functions/fetchAI";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: userInput.value,
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.log(error.message);
  }

  get(conversationDb).then(async (snapshot) => {
    if (snapshot.exists()) {
      const conversationArray = Object.values(snapshot.val());
      conversationArray.unshift(instructionObj);

      push(conversationDb, data.reply.choices[0].message);
      renderTypewriterText(data.reply.choices[0].message.content);
    } else {
      console.log("No data available");
    }
  });
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

document.getElementById("clear-btn").addEventListener("click", () => {
  remove(conversationDb);
  chatbotConversation.innerHTML =
    '<div class="speech speech-ai">How can I help you?</div>';
});

function renderConversationFromDb() {
  get(conversationDb).then(async (snapshot) => {
    if (snapshot.exists()) {
      Object.values(snapshot.val()).forEach((dbObj) => {
        const newSpeechBubble = document.createElement("div");
        newSpeechBubble.classList.add(
          "speech",
          `speech-${dbObj.role === "user" ? "human" : "ai"}`
        );
        chatbotConversation.appendChild(newSpeechBubble);
        newSpeechBubble.textContent = dbObj.content;
      });
      chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
    }
  });
}

renderConversationFromDb();
