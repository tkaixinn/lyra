import { Header } from "@/components/Header";
import { SongGenerator } from "@/components/SongGenerator";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col soft-gradient">
      <Header />
      <main className="flex-1">
        <SongGenerator />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
