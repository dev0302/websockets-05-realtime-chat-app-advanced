import { Route, Routes } from "react-router-dom"
import Chat from "./Chat"
import Home from "./Home"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}></Route>
      <Route path="/room/:roomId" element={<Chat />}></Route>
    </Routes>
  )
}

export default App