import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Wand2, Sparkles } from "lucide-react";
import colaOriginal from "@/assets/cola-original-source.jpg";
import colaLava from "@/assets/cola-lava-clean.jpg";
import colaWinter from "@/assets/cola-winter-clean.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(220_13%_4%)_70%)]"></div>
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight mt-20">
            Your <span className="text-primary">Ads</span> Don't Have To <span className="text-primary">Suck.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Upload any product image and watch AI create stunning advertisements across multiple themes. 
            Then animate them into captivating videos with cutting-edge AI technology.
          </p>
          
          <div className="flex justify-center mb-16">
            <Button size="lg" variant="hero" className="text-lg px-8 py-4" asChild>
              <a href="https://nano-creations-studio.lovable.app/" target="_blank" rel="noopener noreferrer">
                Start Now
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
          </div>
          
          {/* Transformation Showcase */}
          <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            <div className="transform hover:scale-105 transition-smooth md:col-span-2">
              <div className="bg-gradient-card rounded-xl p-8 shadow-card">
                <img 
                  src={colaOriginal} 
                  alt="Original product photo" 
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <div className="text-center">
                  <h3 className="font-semibold mb-2 text-lg">Original Photo</h3>
                  <p className="text-sm text-muted-foreground">Simple product shot</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 text-primary">
                <Wand2 className="w-8 h-8" />
                <ArrowRight className="w-8 h-8" />
              </div>
            </div>
            
            <div className="transform hover:scale-105 transition-smooth md:col-span-2">
              <div className="bg-gradient-card rounded-xl p-8 shadow-card border border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-accent opacity-20 animate-pulse"></div>
                <video 
                  src="https://v3.fal.media/files/tiger/ZkVwK6WPYdRmJhkR7AcQk_output.mp4"
                  className="w-full h-64 object-cover rounded-lg mb-6 relative z-10"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div className="text-center">
                  <h3 className="font-semibold mb-2 text-lg bg-gradient-text bg-clip-text text-transparent">
                    Viral Advertisement
                  </h3>
                  <p className="text-sm text-muted-foreground">AI-generated with dramatic theme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;