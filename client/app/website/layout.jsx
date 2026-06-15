import Navbar from "../../components/website/Navbar";
import CookieConsent from "../../components/website/CookieConsent";
import { Footer } from "../../components/website/Footer";

export default function WebsiteLayout({ children }) {
  return (
    <div className="flex flex-col bg-white min-h-screen h-auto w-full overflow-x-clip">
      <Navbar />
      {/* Main content adjusts dynamically */}
      <main className={`flex-1 flex h-auto w-full`}>
        <div className="w-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
