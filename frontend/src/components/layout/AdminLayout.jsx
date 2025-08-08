import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SideBar from './SideBars'
import Header from "./Header";
import { adminMainMenu } from "../../constants";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsMobileMenuOpen(false); 
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        !event.target.closest("aside") &&
        !event.target.closest("button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSetActiveTab = (tabName) => {
    setActiveTab(tabName);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SideBar
        isSidebarOpen={isSidebarOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        activeTab={activeTab}
        menus={adminMainMenu}
        onToggleSidebar={handleToggleSidebar}
        onToggleMobileMenu={handleToggleMobileMenu}
        onSetActiveTab={handleSetActiveTab}
      />

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "md:ml-64" : "md:ml-16"
        }`}
      >
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleMobileMenu={handleToggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Page content */}
        <main className="p-4 bg-[var(--bg-outer)]">
          <div className="max-w-7xl mx-auto">
            {/* Page title */}
            {/* <div className="mb-4">
              <h1 className="text-xl font-semibold text-green-300">{activeTab}</h1>
              <p className="text-gray-600">Welcome to your dashboard</p>
            </div> */}
            {/* Content area where your pages will be rendered */}
            <div className="bg-white/40 rounded-lg min-h-[calc(100vh-200px)]">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
