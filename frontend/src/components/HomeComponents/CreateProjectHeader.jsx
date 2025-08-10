const CreateProjectHeader = ({ user, onOpenModal }) => {
    const sectionShape = "rounded-[32px]";
  
    return (
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-8 ${sectionShape}`}>
        <h3 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-lg">
          Welcome To{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-400 to-purple-500 font-black text-2xl">
            AI-Chat Bot
          </span>
          <span className="text-lg text-blue-400 ml-4">
            {user ? (
              <header className="inline-block px-3 py-1 bg-green-100 text-green-700 font-bold shadow rounded-full">
                {user.email}
              </header>
            ) : (
              <header className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full shadow">
                Please log in to view your projects.
              </header>
            )}
          </span>
        </h3>
        <button
          className={`bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white px-8 py-3 shadow-xl font-bold text-lg hover:scale-105 hover:from-green-500 hover:to-purple-500 transition-all duration-200 flex items-center gap-2 ${sectionShape}`}
          onClick={onOpenModal}
        >
          <i className="ri-add-circle-fill text-2xl"></i>
          New Project
        </button>
      </div>
    );
  };
  
  export default CreateProjectHeader;
  