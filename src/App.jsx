import "./App.css";
import Chat from "./components/Chat";
import Lobby from "./pages/Lobby";

function App() {
  return (
    <>
      <h1 class="text-3xl font-bold underline">Risk Web</h1>
      <Lobby />
      {/* <Chat></Chat> */}
    </>
  );
}

export default App;
