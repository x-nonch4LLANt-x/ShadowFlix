import "./globals.css";
import MovingBackground from "@/components/MovingBackground";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export const metadata = {
  title: "ShadowFlix",
  description: "Your Empire of Entertainment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MovingBackground />
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Topbar />
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
