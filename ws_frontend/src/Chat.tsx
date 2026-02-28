import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

interface ChatMessage {
  message: string;
  sender: string;
  timestamp: number;
}

type connectionStatus = "connecting" | "connected" | "disconnected";


function Chat() {
  const { roomId } = useParams();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<connectionStatus>("connecting");

  const inputRef = useRef<HTMLInputElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const usernameRef = useRef<string | null>(null);
  const connectRef = useRef<() => void>(() => {});
  const isOnlineRef = useRef<boolean>(navigator.onLine);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingDisplayTimeoutRef = useRef<number | null>(null);

  const typingCooldownRef = useRef<number | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // ask username once
  if (!usernameRef.current) {
    usernameRef.current = prompt("Enter your username") || "Guest";
  }

  function sendTyping() {
    // prevent spam (cooldown active)
    if (typingCooldownRef.current) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "typing" })
      );
    }

    // allow next typing after 1 second
    typingCooldownRef.current = window.setTimeout(() => {
      typingCooldownRef.current = null;
    }, 1000);
  }

  // ---------------- SEND MESSAGE ----------------
  function btnHandler() {
    setTypingUser(null)
    const value = inputRef.current?.value;
    if (!value?.trim()) return;

    // GSAP send pop
    gsap.fromTo(
      inputRef.current,
      { scale: 1 },
      {
        scale: 0.96,
        duration: 0.12,
        repeat: 1,
        yoyo: true,
        ease: "power2.out",
      }
    );

    wsRef.current?.send(
      JSON.stringify({
        type: "chat",
        payload: { message: value },
      })
    );

    inputRef.current!.value = "";
  }

  useEffect(() => {
    const handleOffline = () => {
      isOnlineRef.current = false;
      setStatus("disconnected");

      // stop everything immediately
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      wsRef.current?.close();
      wsRef.current = null;
    };

    const handleOnline = () => {
      console.log("handling online");
      
      isOnlineRef.current = true;
      connectRef.current(); // ✅ resume reconnect
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // ---------------- WEBSOCKET ----------------
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL;
    let ws: WebSocket;
    // let reconnectTimeout: number;
    let isActive = true;
    
    // 3-dots funcn
    const connect = () => {
      console.log("resuming reconect");
      
      // 🚫 do nothing if effect is gone or internet is off
      if (!isActive || !isOnlineRef.current) return;

      // 🚫 already connected
      if (wsRef.current?.readyState === WebSocket.OPEN) return;
      
      setStatus("connecting");
      console.log("set stus conecting");

      ws = new WebSocket(socketUrl);

      wsRef.current = ws;

      console.log("beofre open");
      ws.onopen = () => {
        console.log("insdie open");
        if (!isActive) return;
        console.log("before ocnnected");
        setStatus("connected");
        ws.send(
          JSON.stringify({
            type: "join",
            payload: {
              roomId,
              username: usernameRef.current,
            },
          })
        );
      };

      ws.onmessage = (e) => {
        if (!isActive) return;
        const data = JSON.parse(e.data);

        if (data.type === "typing") {
          setTypingUser(data.payload.username);

          // reset auto-hide timer
          if (typingDisplayTimeoutRef.current) {
            clearTimeout(typingDisplayTimeoutRef.current);
          }

          typingDisplayTimeoutRef.current = window.setTimeout(() => {
            setTypingUser(null);
          }, 1500);
        }

        if (data.type === "system") {
          setMessages((prev) => [
            ...prev,
            {
              message: data.payload.message,
              sender: "system",
              timestamp: data.payload.timestamp,
            },
          ]);
        }

        if (data.type === "chat") {
          setMessages((prev) => [...prev, data.payload]);
        }

        if (data.type === "users") {
          setOnlineUsers(data.payload);
        }

      };

      ws.onclose = () => {
        if (!isActive) return;
        setStatus("disconnected");

        // auto-reconnect after 2s
        // 🔁 retry ONLY if internet is online
        if (isOnlineRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => {
        if (!isActive) return;
        setStatus("disconnected");
        ws.close();
      };
    }

    

    connectRef.current = connect;
    connect();


    return () => {
      isActive = false;
       // ✅ CLEANUP STARTS HERE

      if (typingDisplayTimeoutRef.current) {
        clearTimeout(typingDisplayTimeoutRef.current);
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      wsRef.current?.close();
      ws?.close();
    };
  }, [roomId]);

  // ---------------- AUTOSCROLL ----------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- MESSAGE GSAP ENTRY ----------------
  useEffect(() => {
    const items = document.querySelectorAll("[data-msg]");
    const last = items[items.length - 1];
    if (!last) return;

    gsap.fromTo(
      last,
      { opacity: 0, y: 12, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "expo.out",
      }
    );
  }, [messages]);

  // ---------------- INPUT GSAP ----------------
  useEffect(() => {
    if (!inputRef.current) return;
    const input = inputRef.current;

    const onFocus = () => {
      gsap.to(input, {
        scale: 1.01,
        boxShadow: "0 0 35px rgba(59,130,246,0.2)",
        duration: 0.3,
        ease: "expo.out",
      });
    };

    const onBlur = () => {
      gsap.to(input, {
        scale: 1,
        boxShadow: "0 0 0 rgba(0,0,0,0)",
        duration: 0.3,
        ease: "expo.out",
      });
    };

    input.addEventListener("focus", onFocus);
    input.addEventListener("blur", onBlur);

    return () => {
      input.removeEventListener("focus", onFocus);
      input.removeEventListener("blur", onBlur);
    };
  }, []);

  // ---------------- UI ----------------
  return (
    <div className="h-screen w-full bg-[#01030b] flex justify-center">
      <div className="w-11/12 h-[90%] m-auto flex flex-col">

      {/* CONNECTION STATUS DIV */}
      <div className="flex items-center gap-2 text-sm mb-2">
        {status === "connected" && (
          <span className="text-green-600">🟢 Connected</span>
        )}
        {status === "connecting" && (
          <span className="text-yellow-500">🟡 Reconnecting</span>
        )}
        {status === "disconnected" && (
          <span className="text-red-500">🔴 Disconnected</span>
        )}
      </div>

      {/* ONLINE USERS LIST DIV */}
      {
        status == "connected" && (
          <div className="mb-4 rounded-lg bg-gray-900/50 p-3 border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Online — {onlineUsers.length}
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {onlineUsers.map((user) => {
            const isMe = user === usernameRef.current;
            return (
              <div 
                key={user}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors
                  ${isMe ? "bg-blue-500/10 text-blue-400" : "bg-gray-800 text-gray-300"}`}
              >
                <span className={`h-2 w-2 rounded-full ${isMe ? "bg-blue-400" : "bg-green-500"}`} />
                {user} {isMe && <span className="text-[10px] opacity-60">(You)</span>}
              </div>
            );
          })}
        </div>
      </div>
        )
      }

        {/* CHAT BOX */}
        <div className="flex-1 border border-white/20 rounded-xl p-6 no-scrollbar overflow-y-auto space-y-3">
          {messages.map((msg, i) => {
            const isMe = msg.sender === usernameRef.current;

            if (msg.sender === "system") {
              return (
                <div
                  key={i}
                  className="text-xs text-gray-400 italic text-center"
                >
                  {msg.message}
                </div>
              );
            }

            return (
              <div
                key={i}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  data-msg
                  className={`
                    inline-block
                    max-w-[75%]
                    px-4 py-2
                    rounded-2xl
                    text-sm
                    bg-white/5
                    ${isMe ? "bg-blue-600/20" : ""}
                  `}
                >
                  {!isMe && (
                    <div className="text-xs text-blue-400 font-medium mb-1">
                      {msg.sender}
                    </div>
                  )}

                  <div className="text-gray-200">{msg.message}</div>

                  <div className="text-[10px] text-gray-500 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        {typingUser && (
          <div className="text-sm text-gray-500 italic px-2">
            {typingUser} is typing…
          </div>
        )}
        <div className="mt-4 flex gap-6">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            onChange={sendTyping}
            onKeyDown={(e) => e.key === "Enter" && btnHandler()}
            className="
              flex-1
              bg-[#0f172a]
              text-gray-100
              px-4 py-3
              rounded-xl
              outline-none
              border border-white/5
              placeholder-gray-500
            "
          />

          <button
            onClick={btnHandler}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;