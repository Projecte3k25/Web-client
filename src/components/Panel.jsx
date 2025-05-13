const Panel = ({ children }) => {
  return (
    <div className="w-[90vw] h-[90vh] mx-auto p-6 md:p-10 rounded-2xl shadow-xl bg-white/10 border border-white/20 backdrop-blur-md text-white animate-fadeIn overflow-hidden">
      {children}
    </div>
  );
};

export default Panel;
