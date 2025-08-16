import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    try {
      await register(name, email, password);
      toast.success("Registration successful! Welcome.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to register");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white " >
      <div className=" mt-12 p-2 space-y-2 w-full max-w-md sm:p-6 sm:space-y-6 bg-gray-800 rounded-2xl shadow-lg  ">
        <div className="text-center">
          <h1 className=" text-3xl font-semibold sm:font-bold">Create an Account</h1>
          <p className="text-gray-400">
            Join us and start creating amazing images.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1 px-3 sm:px-0 " >
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>
          <div className="flex flex-col gap-1 px-3 sm:px-0">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1 px-3 sm:px-0">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1 px-3 sm:px-0">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full !mt-6 bg-cyan-500 hover:bg-cyan-600 "
          >
            Create Account
          </Button>
        </form>
        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-cyan-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
