import { useContext, useState, useEffect, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../components/HomeComponents/ProfileMenu";
import CreateProjectHeader from "../components/HomeComponents/CreateProjectHeader";
import ProjectsGrid from "../components/HomeComponents/ProjectsGrid";
import CreateProjectModal from "../components/HomeComponents/CreateProjectModal";
import SearchBar from "../components/HomeComponents/SearchBar";

const API_BASE = "http://localhost:5000";

const Home = () => {
  const { user, logoutUser } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [project, setProject] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchProjects = useCallback(() => {
    axios
      .get(`${API_BASE}/api/projectapi/getall`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setProject(res.data.projects || []))
      .catch(() => setProject([]));
  }, []);

  function createProject(e) {
    e.preventDefault();
    axios
      .post(
        `${API_BASE}/api/projectapi/create`,
        { name: projectName },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      )
      .then(() => {
        setProjectName("");
        setIsModalOpen(false);
        fetchProjects();
      });
  }

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = project.filter((proj) =>
    proj.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 min-h-screen font-[Inter,sans-serif] py-8">
      <main className="space-y-8">
        {/* Search + Profile */}
        <div className="px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Search */}
          
          <SearchBar
           searchQuery={searchQuery}
            setSearchQuery={setSearchQuery} />
          

          {user && (
            <ProfileMenu
              user={user}
              filteredProjects={filteredProjects}
              handleLogout={handleLogout}
            />
          )}
        </div>

        {/* Header */}
        <CreateProjectHeader user={user} onOpenModal={() => setIsModalOpen(true)} />

        {/* Projects */}
        <ProjectsGrid filteredProjects={filteredProjects} navigate={navigate} />

        {/* Modal */}
        {isModalOpen && (
          <CreateProjectModal
            projectName={projectName}
            setProjectName={setProjectName}
            onClose={() => setIsModalOpen(false)}
            onCreate={createProject}
          />
        )}
      </main>
    </div>
  );
};

export default Home;
