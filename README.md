# 💎 eduTrack.
### The Ultimate Assignment & Review Dashboard 
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**eduTrack.** is a high-fidelity, role-based student-assignment management dashboard designed for the Joineazy Frontend Internship task. It delivers a premium SaaS experience using a minimalist architecture and cinematic interactions.

---

## 📽️ Live Demonstration
> [!TIP]
> **Interviewer Quick-Access**
> - **Student Role**: `alice@student.edu` / `pass` (Simple: Click "Quick Student")
> - **Instructor Role**: `dr.smith@instructor.edu` / `pass` (Simple: Click "Quick Instructor")

---

## 🎨 Design Philosophy: "Minimalist Authority"
eduTrack focuses on a **Typography-First** design language, utilizing the elegant **Playfair Display** (Serif) for headings and **Outfit** (Sans) for UI interaction.

- **Zero-Clutter Navigation**: A streamlined header focusing on core workflows (Instructor Hub & Student Portal).
- **Glassmorphism**: Subtle `backdrop-blur` effects ensure a professional, depth-filled user interface.
- **Micro-interactions**: Powered by `framer-motion` to provide tactile feedback on every action.

## 🏗️ Strategic Architecture
Built with scalability and maintainability in mind:
1. **Dynamic Role-Based Shell**: The `DashboardLayout` component interprets session data from a global `AuthContext` to render context-specific navigation dynamically.
2. **Double-Verification Submission**: A core feature engineered to prevent data-loss and accidental student submissions via an animated, high-visibility safe-net modal.
3. **Simulated Persistence (LocalStorage ORM)**: A custom data-access layer (`utils/localStorage.js`) mimics a real backend, providing persistent CRUD operations and cascading deletions.
4. **Drive & External Asset Support**: Fully integrated support for persistent external resource links (e.g., Google Drive, GitHub) mapped directly to assignment payloads.

---

## 📂 Project Structure
```text
src/
|-- components/layout/   # Responsive Sidebar & Bottom-Nav Shell
|-- context/             # Global Auth State & Security Logic
|-- pages/
|   |-- admin/           # Instructor-specific Analytics & Task Creation
|   |-- student/         # Student Task Tracking & Submission Flow
|   \-- Login.jsx        # Premium Entry Page with Cinematic Branding
|-- utils/               # Simulated "Database" ORM for LocalStorage
\-- App.jsx              # Protected Route Management
```

---

## 📥 Local Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/aditya-sonkar/edutrack-assignments-dashboard.git
cd edutrack-assignments-dashboard
npm install
npm run dev
```

## 🚀 Production Build
To generate the optimized production bundle:
```bash
npm run build
```
The application is pre-configured for **Vercel** and **Netlify** with built-in SPA routing support (`vercel.json` and `_redirects`).

---
*Developed with Precision & Craft — 2026*
