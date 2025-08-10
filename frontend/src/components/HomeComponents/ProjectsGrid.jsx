const ProjectsGrid = ({ filteredProjects, navigate }) => {
    const cardGradient = "bg-gradient-to-tr from-white via-green-50 to-blue-50 shadow-xl";
    const sectionShape = "rounded-[32px]";
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-4 mx-auto w-fit text-center mt-8">
        {filteredProjects.length === 0 && (
          <div className="col-span-full text-gray-400 text-xl font-semibold py-12">
            <span className="inline-block animate-pulse">No projects found.</span>
          </div>
        )}
        {filteredProjects.map((project) => (
          <div
            key={project._id}
            onClick={() => navigate(`/project`, { state: { project } })}
            className={`${cardGradient} flex flex-col p-6 border-2 border-green-200 justify-center hover:shadow-2xl hover:scale-105 hover:border-blue-400 transition-all duration-200 cursor-pointer group relative overflow-hidden ${sectionShape}`}
          >
            <div className="absolute -top-4 -right-4 opacity-10 text-8xl pointer-events-none group-hover:opacity-20 transition">
              <i className="ri-folder-3-fill text-green-400"></i>
            </div>
            <h2 className="font-extrabold text-xl text-green-700 mb-2 group-hover:text-blue-600 transition">
              {project.name}
            </h2>
            <div className="flex gap-2 items-center justify-center text-gray-600 text-base font-medium">
              <i className="ri-team-fill text-blue-400 text-lg"></i>
              <span>Collaborators:</span>
              <span className="font-bold text-green-600">{project.users?.length || 0}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default ProjectsGrid;
  