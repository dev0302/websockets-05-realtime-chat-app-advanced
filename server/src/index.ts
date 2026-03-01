// https://petal-estimate-4e9.notion.site/Chat-app-1487dfd107358090af74d91494085834

// Are we creating express application ? No.
// We are creating a web socket server.

// Noo here creating a chat system

import dotenv from "dotenv";
dotenv.config(); // imp for production

// 1. first import WebSocket
import { WebSocket, WebSocketServer } from "ws";
console.log(process.env.PORT);

// 2. create a connection (these 2 lines are enough to create websocket)
const port = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port });

// extra to check server on or not
wss.on("listening", () => {
  console.log(`Server is listening on port ${port}`);
});

// 5. Creating as interface of user so let we can do more things like to restrict messages of partical room to itself etc  
interface User {
    socket: WebSocket;
    room: string;
    username: string;
}

// 6. creating empty array of allSockets to append newly created here.
let allSockets: User[] = [];

// creating a room place to store active users data
const rooms = new Map();

// 3. now this step is something like we do app.post("/signup", (req,res) => {}) .... in express. But here in webSockets since theres no such thing "methods" so here we do just single this this "ws.on"
// now here it says wherenever someone is connecting to my socket then this function "(socket)=>{}" will get called with a refrence to a socket, which lets you talk to that person which is connected to it
// through this socket we can receive or send messages
wss.on("connection", (socket) => {

    console.log("User Connected");

    // 4. Now this is to handle when there come message to this socket from cleint.
    socket.on("message",(message) => {
        console.log("Message Received : " + message.toString() );

        // 7. now since message mei jo message arha vo string type ka hoga, we need to convert it into json. 
        const parsedMessage = JSON.parse(message as unknown as string);

        // 8. now see, we will be having incoming data of this type
        // {
        //     "type": "join",
        //     "payload": {
        //         "roomId": "123"
        //     }
        // }

        // to check if server off or cold-starting
        if (parsedMessage.type === "ping") {
            socket.send(JSON.stringify({ type: "pong" }));
        }

        // for typing effect
        if (parsedMessage.type === "typing") {
            const currentUser = allSockets.find(
                (user) => user.socket === socket
            );

            if (!currentUser) return;

            const typingEvent = {
                type: "typing",
                payload: {
                username: currentUser.username
                }
            };

            // broadcast to others in same room
            for (const user of allSockets) {
                if (
                user.room === currentUser.room &&
                user.socket !== socket // don't send to self
                ) {
                user.socket.send(JSON.stringify(typingEvent));
                }
            }
        }

        // 9. now see if type is join means a there a new entry of person i.e. we will append this socket into global allSocket[] array..
        if (parsedMessage.type == "join") {

            const { roomId, username } = parsedMessage.payload;

            allSockets = allSockets.filter(
                (user) => user.socket !== socket
            );

            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId,
                username: parsedMessage.payload.username
            });


            console.log("User joined room:", parsedMessage.payload.roomId);

            const currentUser = allSockets.find(
                (user) => user.socket === socket
            );

            if (!currentUser) return;

            const outgoingMessage = {
                type: "system",
                payload: {
                    message: `${parsedMessage.payload.username} joined the room`,
                    timestamp: Date.now()
                } 
            }

            for(let i=0; i<allSockets.length; i++) {
                if(allSockets[i]?.room == currentUser.room){
                    // frontend must receive string
                    allSockets[i]?.socket.send(JSON.stringify(outgoingMessage));
                }
            }

            // ✅ ONLINE USERS LIST
            const usersInRoom = allSockets
                .filter(user => user.room === roomId)
                .map(user => user.username);

            const usersMessage = {
                type: "users",
                payload: usersInRoom
            };

            for (const user of allSockets) {
                if (user.room === roomId) {
                user.socket.send(JSON.stringify(usersMessage));
                }
            }

        };

        // 10. and if the type if chat means that person wants to chat for that we will first findout the room of that person
        if (parsedMessage.type == "chat") {
            console.log("User wants to chat");

            const currentUser = allSockets.find(
                (user) => user.socket === socket
            );

            if (!currentUser) return;

            // and then when room is found now we need to send this message to all user of that room
            // 10.1,, adding an better json object so let frontend rececives better and more data
            const outgoingMessage = {
                type: "chat",
                payload: {
                    message: parsedMessage.payload.message,
                    sender: currentUser.username,
                    timestamp: Date.now()
                }
            }

            for(let i=0; i<allSockets.length; i++) {
                if(allSockets[i]?.room == currentUser.room){
                    // frontend must receive string
                    allSockets[i]?.socket.send(JSON.stringify(outgoingMessage));
                }
            }

        };
        
    });

    socket.on("close", () => {

        const leavingUser = allSockets.find(
            (user) => user.socket === socket
        );

        if (!leavingUser) return;

        console.log("User disconnected");

        // remove user
        allSockets = allSockets.filter(
            (user) => user.socket !== socket
        );

        // system leave message
        const systemMessage = {
            type: "system",
            payload: {
            message: `${leavingUser.username} left the room`,
            timestamp: Date.now()
            }
        };

        // notify others in the room
        for (const user of allSockets) {
            if (user.room === leavingUser.room) {
            user.socket.send(JSON.stringify(systemMessage));
            }
        }

        // now for that online list
        const usersInRoom = allSockets
            .filter(user => user.room === leavingUser.room)
            .map(user => user.username);

        const usersMessage = {
            type: "users",
            payload: usersInRoom
        };

        for (const user of allSockets) {
            if (user.room === leavingUser.room) {
            user.socket.send(JSON.stringify(usersMessage));
            }
        }

    });
    
    
});