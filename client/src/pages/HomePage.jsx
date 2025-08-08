import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Send, Github, Twitter, Linkedin } from "lucide-react";
import FeaturesSection from "@/components/features";
import InteractiveStats from "@/components/interactive-stats";
import PricingSection from "../components/PricingSection";

const HeroSection = () => {
  const [textVisible, setTextVisible] = useState(false);
  const [demoHovered, setDemoHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTextVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="text-center z-10 px-6">
        <div
          className={`transition-all duration-1000 ${
            textVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Create
            </span>
            <br />
            <span className="text-white">Without Limits</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional image editing powered by AI. Crop, resize, adjust
            colors, remove backgrounds, and enhance your images with
            cutting-edge technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link to="/dashboard">
              <Button variant="primary" size="xl">
                Start Creating
              </Button>
            </Link>
            <Button variant="glass" size="xl">
              Watch Demo
            </Button>
          </div>
        </div>

        <div
          className={`relative max-w-4xl mx-auto transition-all duration-1000 ${
            textVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-20"
          } ${demoHovered ? "transform scale-105" : ""}`}
          onMouseEnter={() => setDemoHovered(true)}
          onMouseLeave={() => setDemoHovered(false)}
          style={{ perspective: "1000px" }}
        >
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-6 transform-gpu">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-8 min-h-[24rem] sm:min-h-96">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-gray-400 text-sm">ImagineAI</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: "✂️", label: "Crop" },
                  { icon: "📐", label: "Resize" },
                  { icon: "🎨", label: "Adjust" },
                  { icon: "🤖", label: "AI Tools" },
                ].map((tool, index) => (
                  <div
                    key={index}
                    className="backdrop-blur-lg bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all cursor-pointer"
                    title={tool.label}
                  >
                    <div className="text-2xl mb-1">{tool.icon}</div>
                    <div className="text-xs text-gray-400">{tool.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl shadow-2xl shadow-blue-500/50 flex items-center justify-center">
                  <div className="text-white font-bold">Your Canvas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Your message has been sent! We'll get back to you soon.");
      toast.success("Try to Connect on linkedin as well.");
      setFormData({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section className="py-20" id="contact">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-bold mb-4">Get In Touch</h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Have a question, a feature request, or just want to say hello? We'd
            love to hear from you.
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 bg-slate-800/50 border border-white/10 rounded-2xl p-8 md:p-12">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-cyan-400">
                Contact Information
              </h3>
              <p className="text-white/70 mb-6">
                Fill out the form and our team will get back to you within 24
                hours.
              </p>
              <div className="space-y-4">
                <a
                  href="mailto:juberq001@gmail.com"
                  className="flex items-center gap-3 text-white hover:text-cyan-400 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span>support@Imagine.AI</span>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/JuberQureshi01"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Github />
                </a>
                <a
                  href="#"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Twitter />
                </a>
                <a
                  href="https://www.linkedin.com/in/JuberQureshi"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <Linkedin />
                </a>
              </div>
            </div>
          </div>
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Your message..."
                rows={5}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              variant="primary"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
              <Send className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

// Main HomePage Component
export default function HomePage() {
  return (
    <div className="pt-36">
      <HeroSection />
      <InteractiveStats />
      <FeaturesSection />
      <PricingSection />
      <ContactSection />

      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-6">
            Ready to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Create Something Amazing?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of creators who are already using AI to transform
            their images and bring their vision to life.
          </p>
          <Link to="/dashboard">
            <Button variant="primary" size="xl">
              🌟 Start Creating Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
