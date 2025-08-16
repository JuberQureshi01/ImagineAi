🚀 ImagineAI - 🎉

AnAI-powered photo editor built completely from scratch using the PERN stack (PostgreSQL, Express.js, React, Node.js).


🌟 Key Features

✅ Full User Authentication – Custom JWT authentication with secure login/registration.
✅ Project Dashboard – Manage, view, and delete your image editing projects.
✅ Advanced Image Editor (Fabric.js) – Resize, crop, apply filters, adjust brightness/contrast/saturation.
✅ Text Tool – Add & style text with fonts, colors, and sizes.
✅ AI Background Tools (Pro) – Background removal & replacement (via ImageKit AI).
✅ AI Image Extender (Pro) – Expand image borders intelligently with Clipdrop.
✅ AI Retouch (Pro) – One-click AI presets to enhance quality.
✅ AI Image Generation – Generate images from text prompts (Clipdrop API).
✅ Subscription Model – Integrated Razorpay payments to upgrade from Free → Pro.
✅ Responsive Design – Mobile-friendly dashboard & editor.
✅ AI Cleanup (WIP) – Remove unwanted objects with mask-based AI cleanup not fully integrated now.


🛠 Tech Stack & Architecture

🔹 Backend (Server)

Runtime: Node.js

Framework: Express.js

Database: PostgreSQL + Prisma ORM

Authentication: Custom JWT + bcrypt

APIs Integrated:

ImageKit (storage, optimization, background removal)

Clipdrop (AI generation, cleanup)

Razorpay (subscription payments)

🔹 Frontend (Client)

Library: React (with Vite)

Styling: Tailwind CSS + Shadcn UI

Canvas Editor: Fabric.js

State Management: React Hooks (useState, useEffect, useContext)

Routing: React Router

⚡ Setup & Installation
🔧 Prerequisites

Node.js (v18 or later)

npm or yarn

PostgreSQL database

1. Backend Setup
cd server
npm install


Create a .env file and add:

DATABASE_URL="Your_PostgreSQL_Connection_String"
JWT_SECRET="Your_JWT_Secret"
IMAGEKIT_PUBLIC_KEY="..."
IMAGEKIT_PRIVATE_KEY="..."
IMAGEKIT_URL_ENDPOINT="..."
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
CLIPDROP_API_KEY="..."


Run migrations & start server:

npx prisma migrate dev
npm run dev

2. Frontend Setup
cd client
npm install


Create a .env file and add:

VITE_RAZORPAY_KEY_ID="Your_Razorpay_Public_Key_Id"
VITE_UNSPLASH_ACCESS_KEY="Your_Unsplash_Access_Key"


Run the frontend:

npm run dev


👉 App will be available at: https://imagineai-eight.vercel.app/

🔮 Future Improvements

📂 Project Organization – Folder system for dashboard projects.

🖌️ Generative Fill – Select an area & fill using AI + text prompt.

🎨 More Advanced Filters – Multi-step, AI-powered filters.

💡 Final Note

This is my first SaaS product, and building ImagineAI taught me a lot about:

Integrating multiple AI APIs

Setting up subscription models with real payment gateways

Handling scalability & responsiveness

I’ll keep improving it with new AI-powered editing features 🚀
