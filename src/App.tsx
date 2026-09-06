import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { useStore } from "./lib/store";

// Lazy-load heavy pages (charts / 3D) to keep first paint fast.
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Learn = lazy(() => import("./pages/Learn"));
const LessonPage = lazy(() => import("./pages/LessonPage"));
const Lab = lazy(() => import("./pages/Lab"));
const Visualize = lazy(() => import("./pages/Visualize"));
const Algorithms = lazy(() => import("./pages/Algorithms"));
const AlgorithmDetail = lazy(() => import("./pages/AlgorithmDetail"));
const Tutor = lazy(() => import("./pages/Tutor"));
const Challenges = lazy(() => import("./pages/Challenges"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Profile = lazy(() => import("./pages/Profile"));
const Resources = lazy(() => import("./pages/Resources"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-qx-violet/30 border-t-qx-violet" />
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-slate-200 antialiased">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:lessonId" element={<LessonPage />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/visualize" element={<Visualize />} />
            <Route path="/algorithms" element={<Algorithms />} />
            <Route path="/algorithms/:id" element={<AlgorithmDetail />} />
            <Route path="/tutor" element={<Tutor />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/progress" element={<Protected><ProgressPage /></Protected>} />
            <Route path="/achievements" element={<Protected><Achievements /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/admin" element={<Protected><Admin /></Protected>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}