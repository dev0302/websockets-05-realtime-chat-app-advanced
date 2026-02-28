import { Link } from "react-router-dom";



function Home() {



  const baseUrl = import.meta.env.VITE_BASE_URL;



  return (

    <div className="h-screen flex items-center justify-center">

      <div className=" p-8 rounded-lg shadow-md w-[90%] max-w-xl text-center space-y-4">

       

        <h1 className="text-2xl font-semibold">

          WebSocket Chat App

        </h1>



        <p className="">

          Welcome to a chat application created using <b>WebSockets</b>.

        </p>



        <div className="space-y-2">

          <p className="">

            Join a room:

          </p>



          <Link

            to="/room/red"

            className="block text-blue-600 hover:underline font-medium"

          >

            {baseUrl}/room/red

          </Link>



          <p className="text-slate-500 text-sm">

            Or use any room name:

          </p>



          <code className="block px-3 py-2 rounded text-sm">

            {baseUrl}/room/&lt;roomId&gt;

          </code>

        </div>

      </div>

    </div>

  );

}



export default Home;