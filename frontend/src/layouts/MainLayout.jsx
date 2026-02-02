import { Outlet } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import CustomCursor from "../components/CustomCursor";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-brand-50 dark:bg-gray-900">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
      <CustomCursor />
    </div>
  );
};

export default MainLayout;
