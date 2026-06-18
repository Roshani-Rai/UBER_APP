import Footer from "@/componets/Footer";
import Nav from "@/componets/Nav";
import PublicHome from "@/componets/PublicHome";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white">
     <Nav/>
     <PublicHome />
     <Footer />
    </div>
  );
}
