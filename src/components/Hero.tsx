import { Button } from "@/components/ui/button";
import { MessageCircle, Users } from "lucide-react";
import heroImage from "@/assets/hero-willrefrimix.jpg";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0, 61, 107, 0.95), rgba(0, 153, 204, 0.85)), url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Especialista em Projetos e Consultorias Personalizadas
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Já entregamos sistemas de climatização em mansões de alto padrão – e ajudamos profissionais a dominar esse mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => window.open("https://wa.me/5513974139382", "_blank")}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Converse Conosco
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => window.open("https://chat.whatsapp.com/CQv0icXYwohAZkHUFUxvQ4", "_blank")}
            >
              <Users className="mr-2 h-5 w-5" />
              Participe da Comunidade VRF
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
