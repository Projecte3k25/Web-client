const Panel = ({ children }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 rounded-2xl shadow-xl bg-white/10 border border-white/20 backdrop-blur-md text-white animate-fadeIn">
      {children}
    </div>
  );
};

export default Panel;
