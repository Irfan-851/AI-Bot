import { useState } from "react";

const ProfileMenu = ({ user, filteredProjects, handleLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const sectionShape = "rounded-[32px]";

  return (
    <div className="relative">
      <button
        className={`flex items-center gap-3 px-6 py-4 bg-white/80 border-2 border-green-200 
        shadow-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200 ${sectionShape}`}
        onClick={() => setShowProfile((prev) => !prev)}
      >
        <span className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full border-2 border-green-300 shadow-sm">
          <i className="ri-user-3-fill text-green-600 text-xl"></i>
        </span>
        <div className="flex flex-col items-start">
          <span className="font-semibold text-green-700 text-sm">Welcome back</span>
          <span className="font-bold text-green-800 truncate max-w-[150px]">{user.email}</span>
        </div>
        <i
          className={`ri-arrow-down-s-line text-green-500 text-xl transition-transform duration-200 ${
            showProfile ? "rotate-180" : ""
          }`}
        ></i>
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

            {/* Stats */}
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

            {/* Logout */}
            <button
              className="w-full px-4 py-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white font-bold shadow-lg hover:from-green-500 hover:to-purple-500 transition-all duration-200 rounded-xl flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <i className="ri-logout-box-r-line text-lg"></i>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
