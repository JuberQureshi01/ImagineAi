
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider.jsx";
import { Toaster } from "./components/ui/sonner";
import App from "./App.jsx";
import { FloatingShapes } from "./components/floating-shapes.jsx";
import Header from "./components/header.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Toaster />
          <FloatingShapes />
          <main className="bg-slate-900 min-w-full min-h-screen text-white overflow-x-hidden">
            <Header />
            <App />
          </main>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
);