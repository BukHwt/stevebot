(function () {
  console.log("🎉 SteveBot widget loaded");
  console.log("👋 Hi! I'm SteveBot, your friendly assistant.");

  // Add styles
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
      }
    `;
  document.head.appendChild(style);

  // Create chat toggle button
  const btn = document.createElement("button");
  btn.id = "stevebot-btn";
  btn.textContent = "💬";
  document.body.appendChild(btn);

  // Create chat box
  const box = document.createElement("div");
  box.id = "stevebot-box";
  box.innerHTML = `
      <div id="stevebot-messages">
        <div><strong>SteveBot:</strong> 👋 Hi! Ask me anything about Steve.</div>
      </div>
      <div id="stevebot-input">
        <input type="text" placeholder="Type your question..." />
        <button>Send</button>
      </div>
    `;
  document.body.appendChild(box);

  // Toggle box visibility
  btn.onclick = () => {
    box.style.display = box.style.display === "flex" ? "none" : "flex";
    box.style.flexDirection = "column";
  };

  // Handle user input
  box.querySelector("button").onclick = async () => {
    const input = box.querySelector("input");
    const text = input.value.trim();
    if (!text) return;

    addMsg("You", text);
    input.value = "";

    try {
      const res = await fetch("https://stevebot.vercel.app/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: text }),
      });

      const data = await res.json();
      addMsg("SteveBot", data.answer || "Hmm... I didn’t get a response.");
    } catch (err) {
      console.error("SteveBot error:", err);
      addMsg("SteveBot", "Sorry, I fumbled that one. Try again?");
    }
  };

  function addMsg(who, text) {
    const msgBox = document.getElementById("stevebot-messages");
    const div = document.createElement("div");
    div.innerHTML = `<strong>${who}:</strong> ${text}`;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
  }
})();
