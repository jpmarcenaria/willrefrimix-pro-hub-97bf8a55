import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const posts = [
    {
      title: "Como Escolher o Sistema de Climatização Ideal para Mansões",
      excerpt: "Entenda as diferenças entre sistemas VRV/VRF e tradicionais, e descubra qual é a melhor opção para projetos de alto padrão.",
      category: "Projetos",
      readTime: "8 min",
    },
    {
      title: "5 Erros Comuns em Projetos de Ar-Condicionado",
      excerpt: "Evite problemas futuros conhecendo os principais erros cometidos por profissionais na elaboração de projetos de climatização.",
      category: "Dicas Técnicas",
      readTime: "6 min",
    },
    {
      title: "Manutenção Preventiva: Por Que É Essencial?",
      excerpt: "Descubra como a manutenção regular pode aumentar a vida útil do seu sistema e garantir máxima eficiência energética.",
      category: "Manutenção",
      readTime: "5 min",
    },
  ];

  return (
    <section id="blog" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Blog Técnico
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conteúdo técnico de qualidade para profissionais que querem se aprofundar na área de climatização.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {post.readTime} de leitura
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-200">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <Link to="/blog" aria-label="Leia mais do blog">
                  <Button
                    variant="ghost"
                    className="text-primary hover:text-primary/80 p-0 h-auto font-semibold group/btn"
                  >
                    Leia mais
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/blog" aria-label="Ver todos os artigos">
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Ver Todos os Artigos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
