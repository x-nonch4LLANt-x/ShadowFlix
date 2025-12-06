"use client";

import { useState } from "react";
import "./globals.css";
import MovingBackground from "@/components/MovingBackground";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <html lang="en">
      <body>
        <MovingBackground />
        <div className="app-container">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
          <div className="main-content">
            <Topbar onMenuClick={toggleSidebar} />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
