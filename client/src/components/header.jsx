import React from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // Replaced Clerk with our AuthContext
import { BarLoader } from "react-spinners";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export default function Header() {
  const { user, logout, loading } = useAuth(); // Use our custom hook
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (path.includes("/editor")) {
    return null; 
  }

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 text-nowrap">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-8 py-3 flex items-center justify-between gap-8">
        <Link to="/" className="mr-10 md:mr-20">
          <div class="text-3xl italic tracking-tighter">
            <span class="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Imagine
            </span>
            <span class=" text-sm italic text-purple-400">Ai</span>
          </div>
        </Link>

        {path === "/" && (
          <div className="hidden md:flex space-x-6">
            <a
              href="#features"
              className="text-white font-medium transition-all duration-300 hover:text-cyan-400 cursor-pointer"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-white font-medium transition-all duration-300 hover:text-cyan-400 cursor-pointer"
            >
              Pricing
            </a>
            <a
              href="#contact"
              className="text-white font-medium transition-all duration-300 hover:text-cyan-400 cursor-pointer"
            >
              Contact
            </a>
          </div>
        )}

        <div className="flex items-center gap-3 ml-10 md:ml-20">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button
                  variant="glass"
                  className="hidden sm:flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:flex">Dashboard</span>
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="primary"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:flex">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="glass" className="hidden sm:flex">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {loading && (
          <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center">
            <BarLoader width={"95%"} color="#06b6d4" />
          </div>
        )}
      </div>
    </header>
  );
}
