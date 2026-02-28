import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

function Home() {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [room, setRoom] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const rooms = [
    "Fantastic Four",
    "Algo360",
    "Relentless99",
    "MetalicMinds",
  ];

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

  const title = "WebSocket Chat App";

  const handleJoin = () => {
    if (!room.trim()) return;
    navigate(`/room/${room.replace(/\s+/g, "-").toLowerCase()}`);
  };

  return (
    <>
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

          {/* Subtitle + Info Button */}
          <div className="flex items-center justify-center gap-2">
            <p className="text-slate-300">
              Real-time chat powered by <b>WebSockets</b>. Join a room or create your own.
            </p>

            <button
              onClick={() => setShowInfo(true)}
              className="w-5 h-5 rounded-full border border-slate-500 text-xs
                         flex items-center justify-center hover:bg-slate-700 transition"
              title="Know about this mini project"
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
                  className="rounded-lg border border-slate-700 px-4 py-3 hover:bg-slate-800 transition text-sm font-medium"
                >
                  {room}
                </Link>
              ))}
            </div>
          </div>

          {/* Create / Join Room */}
          <div className="space-y-3">
            <p className="font-medium">Create or Join a Room</p>

            <div className="flex gap-2">
              <input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room name..."
                className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 outline-none focus:border-blue-500"
              />

              <button
                onClick={handleJoin}
                className="rounded-lg bg-blue-600 px-5 py-2 font-medium hover:bg-blue-500 transition"
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

      {/* Info Modal */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-slate-900 rounded-xl p-6 w-[90%] max-w-xl text-left space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                About This Mini Project
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-medium mb-2">🚀 Features</h3>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                <li>Real-time messaging using WebSockets</li>
                <li>Room-based chat system</li>
                <li>Live online users list (per room)</li>
                <li>Typing indicator with auto-clear</li>
                <li>Auto-reconnect & network awareness</li>
                <li>Server-side message timestamps</li>
                <li>In-memory state management</li>
                <li>Polished dark-themed UI</li>
              </ul>
            </div>

            {/* Future Improvements */}
            <div>
              <h3 className="font-medium mb-2">🧩 What’s Left / Future Improvements</h3>
              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                <li>Message persistence using a database</li>
                <li>User authentication & authorization</li>
                <li>Chat history loading on reconnect</li>
                <li>Read receipts & delivery status</li>
                <li>Private (1-to-1) messaging</li>
                <li>File / image sharing</li>
                <li>Scalable state management (Redis)</li>
                <li>Deployment & production optimizations</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;