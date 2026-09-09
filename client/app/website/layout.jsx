import Navbar from "../../components/website/Navbar";
import CookieConsent from "../../components/website/CookieConsent";
import { Footer } from "../../components/website/Footer";

export default function WebsiteLayout({ children }) {
  return (
    <div className="flex min-h-screen h-auto w-full flex-col bg-[#F4F7FB] dark:bg-dark-main">
      <Navbar />
      <main className="flex-1 flex h-auto w-full min-w-0 overflow-x-hidden">
        <div className="w-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
