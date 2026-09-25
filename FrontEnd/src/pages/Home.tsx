{/*importação dos componentes do layout (Topo, Rodapé e Botão Flutuante) */}
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HelpButton } from '../components/layout/HelpButton';

{/*importação das seções de conteudo da pagina */}
import { HeroSection } from '../components/sections/HeroSection';
import { StatsSection } from '../components/sections/StatsSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { AboutSection } from '../components/sections/AboutSection';
import { FeaturedProductsSection } from '../components/sections/FeaturedProductsSection';
import { CtaBanner } from '../components/sections/CtaBanner';

{/*principal componente da home 
  funciona como o "orquestrador" do site: junta todos os blocos na ordem correta. */}
export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f5f2] text-[#2c2825] font-sans relative"> {/*obs. o relative permite
       que elementos com posição fixa/absoluta (como o botão de ajuda) se posicionem corretamente. */}
      <Header />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <AboutSection />
      <FeaturedProductsSection />
      <CtaBanner /> {/*Call to Action*/}
      <Footer />
      <HelpButton />
    </div>
  );
}
