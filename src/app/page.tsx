"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import {
  Zap,
  Sparkles,
  Target,
  BarChart3,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { HeroButton } from "@/components/ui/hero-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/layout/Navigation";

const HomeContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Typing animation state
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const phrases = [
    'Social Content',
    'Engaging Posts',
    'Viral Marketing',
    'Brand Stories',
    'Content Strategy',
    'Digital Presence'
  ];

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Clean URL by removing NextAuth callback parameters
  useEffect(() => {
    if (status === "unauthenticated" && searchParams && searchParams.toString()) {
      // Check if there are any NextAuth-related parameters
      const hasCallbackUrl = searchParams.has('callbackUrl');
      const hasError = searchParams.has('error');
      const hasCode = searchParams.has('code');

      if (hasCallbackUrl || hasError || hasCode) {
        // Clean the URL by replacing with just the base path
        router.replace('/', { scroll: false });
      }
    }
  }, [status, searchParams, router]);

  // Typing animation effect
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentPhrase.length) {
        // Type next character
        timeout = setTimeout(() => {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        }, 100); // Typing speed
      } else {
        // Finished typing, wait before erasing
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause before erasing
      }
    } else {
      if (displayText.length > 0) {
        // Erase characters
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50); // Erasing speed
      } else {
        // Finished erasing, move to next phrase
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentPhraseIndex, phrases]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, don't render the home page (redirect happens in useEffect)
  if (status === "authenticated") {
    return null;
  }
  const features = [
    {
      icon: Sparkles,
      title: "AI Content Generation",
      description: "Create platform-optimized content with advanced AI that understands each social media platform's unique style and requirements."
    },
    {
      icon: Target,
      title: "Platform Optimization",
      description: "Automatically adapt your content for Instagram, Twitter, LinkedIn, and Facebook with platform-specific formatting and hashtags."
    },
    {
      icon: Calendar,
      title: "Content Planning",
      description: "Visual calendar interface to plan and organize your content strategy across all platforms in one centralized location."
    },
    {
      icon: BarChart3,
      title: "Performance Insights",
      description: "Track your content performance and get AI-powered suggestions to improve engagement and reach."
    },
    {
      icon: Users,
      title: "Multi-Profile Management",
      description: "Manage multiple social media profiles and brands from a single dashboard with seamless switching."
    },
    {
      icon: Zap,
      title: "Instant Previews",
      description: "See exactly how your content will look on each platform before publishing with our realistic preview system."
    }
  ];

  const benefits = [
    "Save 10+ hours per week on content creation",
    "Generate platform-optimized content instantly",
    "Maintain consistent brand voice across platforms",
    "Plan and visualize your content strategy",
    "Professional-grade content at your fingertips"
  ];

  return (
    <div className=" bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 px-4 overflow-hidden min-h-screen flex items-center">
        {/* Background Gradient - Desktop Only */}
        <div className="absolute inset-0 bg-hero-gradient opacity-10 hidden md:block"></div>
        <div className="relative max-w-7xl mx-auto text-center px-2 md:px-4">
          <div className="animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              <span className="inline-block">Create Amazing</span>
              <br />
              <span className="mt-2 md:mt-3 pb-4 md:pb-6 bg-hero-gradient bg-clip-text text-transparent inline-block min-w-[180px] sm:min-w-[220px] md:min-w-[300px] lg:min-w-[400px]">
                {displayText}
                <span className={`inline-block w-0.5 md:w-1 h-6 md:h-8 lg:h-16 ml-0.5 md:ml-1 bg-primary ${isTyping ? 'animate-pulse' : ''}`}></span>
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto px-2 leading-relaxed">
              AI-powered social media management for creators, influencers, and brands.
              Generate platform-optimized content in seconds, not hours
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 px-4">
              <HeroButton
                variant="hero"
                size="lg"
                className="w-full sm:w-auto animate-pulse-soft text-sm md:text-base"
                onClick={() => signIn("google")}
              >
                Start Creating Free
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </HeroButton>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <HeroButton variant="hero-outline" size="lg" className="w-full text-sm md:text-base">
                  View Dashboard
                </HeroButton>
              </Link>
            </div>

            {/* Mobile-Optimized Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-8 max-w-4xl mx-auto px-2">
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 md:mb-2">10x</div>
                <div className="text-xs sm:text-sm md:text-base text-muted-foreground leading-tight">Faster Content<br className="hidden sm:block" /> Creation</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 md:mb-2">500+</div>
                <div className="text-xs sm:text-sm md:text-base text-muted-foreground leading-tight">Happy<br className="hidden sm:block" /> Creators</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 md:mb-2">24/7</div>
                <div className="text-xs sm:text-sm md:text-base text-muted-foreground leading-tight">AI-Powered<br className="hidden sm:block" /> Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Floating Elements */}
        <div className="absolute top-16 md:top-20 left-4 md:left-10 w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full animate-float shadow-lg"></div>
        <div className="absolute bottom-16 md:bottom-20 right-4 md:right-10 w-10 h-10 md:w-12 md:h-12 bg-twitter/20 rounded-full animate-float shadow-lg" style={{animationDelay: "2s"}}></div>
        <div className="absolute top-32 md:top-40 right-6 md:right-20 w-6 h-6 md:w-8 md:h-8 bg-instagram/20 rounded-full animate-float shadow-lg" style={{animationDelay: "4s"}}></div>
        <div className="absolute bottom-32 md:bottom-40 left-6 md:left-20 w-8 h-8 md:w-10 md:h-10 bg-linkedin/20 rounded-full animate-float shadow-lg" style={{animationDelay: "1s"}}></div>
        <div className="absolute top-48 md:top-60 left-1/4 w-4 h-4 md:w-6 md:h-6 bg-facebook/20 rounded-full animate-float shadow-lg" style={{animationDelay: "3s"}}></div>
        <div className="absolute bottom-48 md:bottom-60 right-1/4 w-10 h-10 md:w-14 md:h-14 bg-primary/15 rounded-full animate-float shadow-lg" style={{animationDelay: "5s"}}></div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Powerful features designed to streamline your social media workflow and amplify your online presence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 card-gradient p-4 md:p-6">
                  <CardHeader className="pb-3 md:pb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-hero-gradient rounded-lg flex items-center justify-center mb-3 md:mb-4 group-hover:shadow-glow transition-all duration-300">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg md:text-xl leading-tight">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Why Choose SocialFlow?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of creators who've transformed their social media strategy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <p className="text-lg text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
            <div className="bg-hero-gradient rounded-2xl p-8 text-white text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold mb-2">10x</div>
                <div className="text-xl opacity-90">Faster Content Creation</div>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-lg opacity-90">Happy Creators</div>
              </div>
              <HeroButton variant="hero-outline" size="lg" className="bg-white/20 border-white/30 hover:bg-white/30">
                Join Now
              </HeroButton>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-hero-gradient">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start creating professional, engaging content that converts. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <HeroButton
              variant="hero-outline"
              size="xl"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => signIn("google")}
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </HeroButton>
          </div>
          <p className="text-sm opacity-80 mt-4">
            ✨ Full functionality requires Supabase integration for AI features
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">SocialFlow</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Empowering creators with AI-powered social media management
          </p>
          <p className="text-sm text-muted-foreground">
            © 2024 SocialFlow. Built with ❤️ for creators everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
};

const Home = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
};

export default Home;
