import { useContext, useState, useEffect, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000"; // Update to match your backend port

const gradientBg =
  "bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 min-h-screen";
const cardGradient =
  "bg-gradient-to-tr from-white via-green-50 to-blue-50 shadow-xl";
const fontFamily = "font-[Inter,sans-serif]";

const sectionShape = "rounded-[32px]"; // Custom section shape

const Home = () => {
  const { user, logoutUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  // Fetch all projects
  const fetchProjects = useCallback(() => {
    axios
      .get(`${API_BASE}/api/projectapi/getall`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setProject(res.data.projects || []);
      })
      .catch((error) => {
        console.log(error);
        setProject([]); // fallback to empty array on error
      });
  }, []);

  //create project function
  function createProject(e) {
    e.preventDefault();
    axios
      .post(
        `${API_BASE}/api/projectapi/create`,
        {
          name: projectName,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((res) => {
        setProjectName("");
        setIsModalOpen(false);
        fetchProjects(); // Refresh project list after creation
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Logout function
  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  //get all projects function
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = project.filter((proj) =>
    proj.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${gradientBg} ${fontFamily} py-8`}>
      <main className="space-y-8">
        {/* Header Section with Search and Profile */}
        <div className="px-8 space-y-6">
          {/* Search and Profile Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Search Input */}
            <div className={`flex items-center px-6 py-4 border-2 border-green-300 focus-within:border-green-500 overflow-hidden max-w-lg w-full shadow-md bg-white/80 backdrop-blur-md ${sectionShape}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 192.904 192.904"
                width="22px"
                className="fill-green-500 mr-3"
              >
                <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
              </svg>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full outline-none text-lg bg-transparent placeholder:text-green-400 text-green-700 font-medium"
                style={{ fontFamily: "inherit" }}
              />
            </div>

            {/* Profile Section */}
            {user && (
              <div className="relative">
                <button
                  className={`flex items-center gap-3 px-6 py-4 bg-white/80 border-2 border-green-200 
                  shadow-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 ${sectionShape}`}
                  onClick={() => setShowProfile((prev) => !prev)}
                  aria-label="Show profile"
                >
                  <span className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full border-2 border-green-300 shadow-sm">
                    <i className="ri-user-3-fill text-green-600 text-xl"></i>
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-green-700 text-sm">Welcome back</span>
                    <span className="font-bold text-green-800 truncate max-w-[150px]">{user.email}</span>
                  </div>
                  <i className={`ri-arrow-down-s-line text-green-500 text-xl transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`}></i>
                </button>
                
                {showProfile && (
                  <div className="absolute right-0 mt-3 z-20 animate-fadeIn">
                    <div className="bg-white border-2 border-green-200 shadow-2xl rounded-2xl p-6 min-w-[280px]">
                      {/* Profile Header */}
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-green-100">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full border-3 border-green-300 shadow-lg">
                          <i className="ri-user-3-fill text-green-600 text-3xl"></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-green-800 text-lg">User Profile</h3>
                          <p className="text-green-600 text-sm break-all">{user.email}</p>
                        </div>
                      </div>
                      
                      {/* Profile Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                          <div className="text-2xl font-bold text-green-600">{filteredProjects.length}</div>
                          <div className="text-xs text-green-500 font-medium">Projects</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">Active</div>
                          <div className="text-xs text-blue-500 font-medium">Status</div>
                        </div>
                      </div>
                      
                      {/* Logout Button */}
                      <button
                        className={`w-full px-4 py-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white font-bold shadow-lg hover:from-green-500 hover:to-purple-500 transition-all duration-200 rounded-xl flex items-center justify-center gap-2`}
                        onClick={handleLogout}
                      >
                        <i className="ri-logout-box-r-line text-lg"></i>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create Project Button and Welcome */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-8 ${sectionShape}`}>
          <h3 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-lg">
            Welcome To{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-400 to-purple-500 font-black text-2xl">
              AI-Chat Bot
            </span>
            <span className="text-lg text-blue-400 ml-4 cursor-pointer hover:underline font-semibold">
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
            onClick={() => setIsModalOpen(true)}
          >
            <i className="ri-add-circle-fill text-2xl"></i>
            New Project
          </button>
        </div>

        {/* Projects Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-4 mx-auto w-fit text-center mt-8">
          {filteredProjects.length === 0 && (
            <div className="col-span-full text-gray-400 text-xl font-semibold py-12">
              <span className="inline-block animate-pulse">
                No projects found.
              </span>
            </div>
          )}
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => {
                navigate(`/project`, {
                  state: { project },
                });
              }}
              className={`${cardGradient} flex flex-col p-6 border-2 border-green-200 justify-center hover:shadow-2xl hover:scale-105 hover:border-blue-400 transition-all duration-200 cursor-pointer group relative overflow-hidden ${sectionShape}`}
              style={{
                fontFamily: "inherit",
                minHeight: "140px",
              }}
            >
              <div className="absolute -top-4 -right-4 opacity-10 text-8xl pointer-events-none select-none group-hover:opacity-20 transition">
                <i className="ri-folder-3-fill text-green-400"></i>
              </div>
              <h2 className="font-extrabold text-xl text-green-700 mb-2 group-hover:text-blue-600 transition">
                {project.name}
              </h2>
              <div className="flex gap-2 items-center justify-center text-gray-600 text-base font-medium">
                <i className="ri-team-fill text-blue-400 text-lg"></i>
                <span>Collaborators:</span>
                <span className="font-bold text-green-600">
                  {project.users?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Creating Project */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className={`bg-gradient-to-br from-white via-green-50 to-blue-100 p-8 shadow-2xl w-full max-w-lg border-2 border-green-200 relative animate-fadeIn ${sectionShape}`}>
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold transition"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                type="button"
              >
                &times;
              </button>
              <h2 className="text-2xl font-extrabold text-green-700 mb-6 text-center tracking-tight">
                Create New Project
              </h2>
              <form onSubmit={createProject}>
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
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className={`px-5 py-2 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition ${sectionShape}`}
                    onClick={() => setIsModalOpen(false)}
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
        )}
      </main>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95);}
          to { opacity: 1; transform: scale(1);}
        }
      `}</style>
    </div>
  );
};

export default Home;