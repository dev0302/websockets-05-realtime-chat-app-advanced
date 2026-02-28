import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

function Home() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [room, setRoom] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [serverReady, setServerReady] = useState(false);

  const rooms = [
    "Fantastic Four",
    "Algo360",
    "Relentless99",
    "MetalicMinds",
  ];

  /* Title animation */
  useEffect(() => {
    if (!titleRef.current) return;

    const letters =
      titleRef.current.querySelectorAll<HTMLSpanElement>(".char");

    gsap.fromTo(
      letters,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.6,
        ease: "power3.out",
      }
    );
  }, []);

  /* Cold start detection */
  useEffect(() => {
    const checkServer = async () => {
      try {
        await fetch(baseUrl, { method: "GET" });
        setServerReady(true);
      } catch {
        setTimeout(checkServer, 2000);
      }
    };

    checkServer();
  }, [baseUrl]);

  const title = "WebSocket Chat App";

  const handleJoin = () => {
    if (!room.trim() || !serverReady) return;
    navigate(`/room/${room.replace(/\s+/g, "-").toLowerCase()}`);
  };

  return (
    <>
      {/* Cold Start Spinner */}
      {!serverReady && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          <p className="mt-4 text-slate-300 text-sm text-center max-w-xs">
            Please wait a few seconds, server is cold starting…
          </p>
        </div>
      )}

      {/* Main Page */}
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="p-8 rounded-xl bg-slate-900/70 backdrop-blur shadow-xl w-[90%] max-w-2xl space-y-8 text-center">

          {/* Title */}
          <h1 ref={titleRef} className="text-3xl font-bold overflow-hidden">
            {title.split("").map((char, index) => (
              <span key={index} className="char inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          {/* Subtitle + Info */}
          <div className="flex items-center justify-center gap-2">
            <p className="text-slate-300">
              Real-time chat powered by <b>WebSockets</b>.
            </p>

            <button
              onClick={() => setShowInfo(true)}
              className="w-5 h-5 rounded-full border border-slate-500 text-xs
                         flex items-center justify-center hover:bg-slate-700 transition"
            >
              i
            </button>
          </div>

          {/* Preset Rooms */}
          <div className="space-y-3">
            <p className="font-medium">Popular Rooms</p>
            <div className="grid grid-cols-2 gap-3">
              {rooms.map((room) => (
                <Link
                  key={room}
                  to={`/room/${room.replace(/\s+/g, "-").toLowerCase()}`}
                  className={`rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium
                    ${serverReady ? "hover:bg-slate-800" : "opacity-50 pointer-events-none"}`}
                >
                  {room}
                </Link>
              ))}
            </div>
          </div>

          {/* Join Room */}
          <div className="space-y-3">
            <p className="font-medium">Create or Join a Room</p>

            <div className="flex gap-2">
              <input
                disabled={!serverReady}
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room name..."
                className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2
                           outline-none focus:border-blue-500 disabled:opacity-50"
              />

              <button
                disabled={!serverReady}
                onClick={handleJoin}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium
                           hover:bg-blue-500 transition disabled:opacity-50"
              >
                Join
              </button>
            </div>

            <p className="text-xs text-slate-400">
              URL format: {baseUrl}/room/&lt;roomId&gt;
            </p>
          </div>
        </div>
      </div>

      {/* Info Modal (unchanged) */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-40"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-slate-900 rounded-xl p-6 w-[90%] max-w-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">About This Mini Project</h2>
              <button onClick={() => setShowInfo(false)}>✕</button>
            </div>

            <h3 className="font-medium">🚀 Features</h3>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
              <li>Real-time messaging using WebSockets</li>
              <li>Room-based chat system</li>
              <li>Live online users list</li>
              <li>Typing indicator</li>
              <li>Auto reconnect</li>
            </ul>

            <h3 className="font-medium">🧩 What’s Left</h3>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
              <li>Message persistence</li>
              <li>Authentication</li>
              <li>Private messaging</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;