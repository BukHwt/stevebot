(function () {
  console.log("🎉 SteveBot widget loaded");
  console.log("👋 Hi! I'm SteveBot, your friendly assistant.");

  const style = document.createElement("style");
  style.innerHTML = `
      #stevebot-btn {
        position: fixed;
        bottom: 16px;
        left: 16px;
        z-index: 9999;
        background-color: #0076b6;
        color: white;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
  
      #stevebot-box {
        position: fixed;
        bottom: 72px;
        left: 16px;
        width: 90vw;
        max-width: 360px;
        height: 60vh;
        max-height: 480px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: none;
        flex-direction: column;
        z-index: 9998;
      }
  
      #stevebot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        font-family: sans-serif;
        font-size: 14px;
        color: black;
      }
  
      #stevebot-input {
        display: flex;
        border-top: 1px solid #eee;
      }
  
      #stevebot-input input {
        flex: 1;
        padding: 12px;
        font-size: 14px;
        border: none;
        outline: none;
      }
  
      #stevebot-input button {
        background: #0076b6;
        color: white;
        border: none;
        padding: 12px;
        cursor: pointer;
        border-radius: 20px;
        margin: 10px 10px 10px 0;
      }

    @keyframes blink {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
    }

    .stevebot-typing em {
        font-style: italic;
        color: #555;
    }

    .stevebot-typing span {
        animation: blink 1.4s infinite;
        font-weight: bold;
    }

    .stevebot-typing .dot-1 { animation-delay: 0s; }
    .stevebot-typing .dot-2 { animation-delay: 0.2s; }
    .stevebot-typing .dot-3 { animation-delay: 0.4s; }
    .stevebot-msg {
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
        font-family: sans-serif;
    }

    .stevebot-msg.user {
        align-items: flex-end;
    }

    .stevebot-msg.bot {
        align-items: flex-start;
    }

    .stevebot-bubble {
        padding: 8px 12px;
        border-radius: 16px;
        max-width: 80%;
        word-wrap: break-word;
    }

    .stevebot-msg.user .stevebot-bubble {
        background-color: #0076b6;
        color: white;
        border-bottom-right-radius: 0;
    }

    .stevebot-msg.bot .stevebot-bubble {
        background-color: #eee;
        color: black;
        border-bottom-left-radius: 0;
    }

    .stevebot-timestamp {
        font-size: 11px;
        color: #999;
        margin-top: 2px;
    }
    `;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.id = "stevebot-btn";
  btn.textContent = "💬";
  document.body.appendChild(btn);

  const box = document.createElement("div");
  box.id = "stevebot-box";
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  box.innerHTML = `
    <div id="stevebot-messages">
      <div class="stevebot-msg bot">
        <div class="stevebot-bubble">
          👋 Hi! Ask me anything about Steve.
        </div>
        <div class="stevebot-timestamp">${timestamp}</div>
      </div>
    </div>
    <div id="stevebot-input">
      <input type="text" placeholder="Type your question..." />
      <button>Send</button>
    </div>
  `;
  document.body.appendChild(box);

  btn.onclick = () => {
    box.style.display = box.style.display === "flex" ? "none" : "flex";
    box.style.flexDirection = "column";
  };

  const input = box.querySelector("input");
  const sendBtn = box.querySelector("button");
  const msgBox = document.getElementById("stevebot-messages");

  document.addEventListener("click", function (e) {
    const isClickInsideBox = box.contains(e.target);
    const isClickOnButton = btn.contains(e.target);

    if (!isClickInsideBox && !isClickOnButton && box.style.display === "flex") {
      box.style.display = "none";
    }
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMsg("You", text);
    input.value = "";
    input.blur();
    sendBtn.disabled = true;

    let typingEl = document.createElement("div");
    typingEl.id = "stevebot-typing";
    typingEl.className = "stevebot-typing";
    typingEl.innerHTML = `
      <em>SteveBot is typing<span class="dot-1">.</span><span class="dot-2">.</span><span class="dot-3">.</span></em>
    `;
    msgBox.appendChild(typingEl);
    msgBox.scrollTop = msgBox.scrollHeight;

    try {
      console.log("Starting SteveBot run...");
      const startRes = await fetch(
        "https://stevebot.vercel.app/api/start-run",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text }),
        }
      );

      if (!startRes.ok) throw new Error("Failed to start SteveBot");

      const { threadId, runId } = await startRes.json();

      let completed = false;
      let attempts = 0;
      let answer = null;

      while (!completed && attempts < 20) {
        await new Promise((r) => setTimeout(r, 1000));

        const checkRes = await fetch(
          "https://stevebot.vercel.app/api/check-run",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ threadId, runId }),
          }
        );

        if (!checkRes.ok) throw new Error("Failed to check SteveBot status");

        const checkData = await checkRes.json();

        if (checkData.status === "completed") {
          completed = true;
          answer = checkData.answer;
        }

        attempts++;
      }

      typingEl.remove();
      typingEl = null;

      if (answer) {
        addMsg("SteveBot", answer);
      } else {
        addMsg(
          "SteveBot",
          "SteveBot is still thinking. Try again in a few seconds."
        );
      }
    } catch (err) {
      console.error("SteveBot error:", err);
      if (typingEl) typingEl.remove();
      addMsg("SteveBot", "Sorry, I fumbled that one. Try again?");
    } finally {
      sendBtn.disabled = false;
      if (!/Mobi|Android/i.test(navigator.userAgent)) {
        input.focus();
      }
    }
  }

  sendBtn.onclick = sendMessage;

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  function addMsg(who, text) {
    const div = document.createElement("div");
    div.className = `stevebot-msg ${who === "You" ? "user" : "bot"}`;

    const bubble = document.createElement("div");
    bubble.className = "stevebot-bubble";
    bubble.innerText = text;

    const timestamp = document.createElement("div");
    timestamp.className = "stevebot-timestamp";
    timestamp.innerText = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    div.appendChild(bubble);
    div.appendChild(timestamp);

    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  }
})();
