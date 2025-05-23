const GameBoard = ({ children }) => {
  return (
    <div
      className="w-full h-screen bg-cover  bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/papiro.jpg')" }}
    >
      <div className="w-[100vw] h-[100vh]    p-4 md:p-10 relative overflow-hidden ">
        {children}
      </div>
    </div>
  );
};

export default GameBoard;
