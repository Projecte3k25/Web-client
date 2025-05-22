const GameBoard = ({ children }) => {
  return (
    <div
      className="w-full h-screen bg-cover  bg-center flex items-center justify-center overflow-hidden relative"
      style={{ backgroundImage: "url('/papiro.jpg')" }}
    >
      <div className="w-[100vw] h-[100vh] shadow-2xl border border-white/20 backdrop-blur-md p-4 md:p-10 relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default GameBoard;
