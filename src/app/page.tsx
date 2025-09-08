"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
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

const Home = () => {
  const { data: session } = useSession();
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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Create Amazing
              <span className="bg-hero-gradient bg-clip-text text-transparent"> Social Content</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              AI-powered social media management for creators, influencers, and brands.
              Generate platform-optimized content in seconds, not hours
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <HeroButton
                variant="hero"
                size="xl"
                className="animate-pulse-soft"
                onClick={() => signIn("google")}
              >
                Start Creating Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </HeroButton>
              <Link href="/dashboard">
                <HeroButton variant="hero-outline" size="xl">
                  View Dashboard
                </HeroButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-primary/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-10 w-12 h-12 bg-twitter/20 rounded-full animate-float" style={{animationDelay: "2s"}}></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-instagram/20 rounded-full animate-float" style={{animationDelay: "4s"}}></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline your social media workflow and amplify your online presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 card-gradient">
                  <CardHeader>
                    <div className="w-12 h-12 bg-hero-gradient rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
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

export default Home;
