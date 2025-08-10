const CreateProjectModal = ({
    projectName,
    setProjectName,
    onClose,
    onCreate
  }) => {
    const sectionShape = "rounded-[32px]";
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <div
          className={`bg-gradient-to-br from-white via-green-50 to-blue-100 p-8 shadow-2xl w-full max-w-lg border-2 border-green-200 relative animate-fadeIn ${sectionShape}`}
        >
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold transition"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-2xl font-extrabold text-green-700 mb-6 text-center">
            Create New Project
          </h2>
          <form onSubmit={onCreate}>
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-2">
                Project Name
              </label>
              <input
                onChange={(e) => setProjectName(e.target.value)}
                value={projectName}
                type="text"
                className={`w-full p-3 border-2 border-green-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 text-lg font-medium text-green-700 bg-white/80 placeholder:text-green-300 transition ${sectionShape}`}
                required
                placeholder="Enter your project name"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className={`px-5 py-2 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition ${sectionShape}`}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white font-bold text-lg shadow hover:from-green-500 hover:to-purple-500 transition ${sectionShape}`}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default CreateProjectModal;
  