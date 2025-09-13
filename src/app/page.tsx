"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";

import {
  Zap,
  Sparkles,
  Calendar,
  ArrowRight,
  CheckCircle,
  ClockIcon,
  ImageIcon,
  Flag,
  Star
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
    'Engaging Posts', 
    'Catchy Images',
    'Viral Content',
    'Brand Stories',
  ];

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Clean URL by removing NextAuth callback parameters
  useEffect(() => {
    if (searchParams && searchParams.toString()) {
      // Check if there are any NextAuth-related parameters
      const hasCallbackUrl = searchParams.has('callbackUrl');
      const hasError = searchParams.has('error');
      const hasCode = searchParams.has('code');

      if (hasCallbackUrl || hasError || hasCode) {
        // Clean the URL by replacing with just the base path
        router.replace('/', { scroll: false });
      }
    }
  }, [searchParams, router]);

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
      title: "AI Writing",
      description: "Generate platform-ready captions, posts, and ideas with smart AI trained for every social network’s unique style."
    },
    {
      icon: ImageIcon,
      title: "AI Images",
      description: "Create eye-catching visuals with AI-powered image generation tailored for your content needs."
    },
    {
      icon: Flag,
      title: "Sync Platforms",
      description: "Publish once and share instantly across Instagram, Twitter, LinkedIn, and Facebook without repeating work."
    },
    {
      icon: Calendar,
      title: "Smart Calendar",
      description: "Plan, schedule, and visualize your posts and events in a powerful, easy-to-use calendar view."
    },
    {
      icon: Star,
      title: "Live Preview",
      description: "See exactly how your content will look on each platform before publishing with instant previews."
    },
    {
      icon: ClockIcon,
      title: "Time Saver",
      description: "Reduce effort, cut the hustle, and save hours every week with streamlined tools built for creators."
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
    <motion.div
      className="bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Navigation />

      {/* Hero Section */}
      <motion.section
        className="relative py-16 md:py-20 px-4 overflow-hidden min-h-screen flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        aria-labelledby="hero-heading"
      >
        {/* Background Gradient - Desktop Only */}
        <motion.div
          className="absolute inset-0 bg-hero-gradient opacity-10 hidden md:block"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        ></motion.div>

        <div className="relative max-w-7xl mx-auto text-center px-2 md:px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Cast magic spells to create
              </motion.span>
              <br />
              <motion.span
                className="mt-2 md:mt-3 pb-4 md:pb-6 bg-hero-gradient bg-clip-text text-transparent inline-block min-w-[180px] sm:min-w-[220px] md:min-w-[300px] lg:min-w-[400px]"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                {displayText}
                <motion.span
                  className={`inline-block w-0.5 md:w-1 h-6 md:h-8 lg:h-16 ml-0.5 md:ml-1 bg-primary ${isTyping ? 'animate-pulse' : ''}`}
                  animate={{ opacity: isTyping ? [1, 0, 1] : 1 }}
                  transition={{ duration: 1, repeat: isTyping ? Infinity : 0 }}
                  aria-hidden="true"
                ></motion.span>
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl lg:max-w-4xl mx-auto px-2 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              AI-powered social media management for creators, influencers, and brands.
              Generate platform-optimized content in seconds, & save hours
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <HeroButton
                  variant="hero"
                  size="lg"
                  className="w-full sm:w-auto animate-pulse-soft text-sm md:text-base"
                  onClick={() => signIn("google")}
                >
                  Start Creating Free
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                </HeroButton>
              </motion.div>

              <motion.div
                onClick={() => signIn("google")}
                className="w-full sm:w-auto cursor-pointer"
                whileHover={{ scale: 1.05, rotate: 1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="w-full overflow-hidden p-0.5 bg-hero-gradient rounded-md"
                  whileHover={{ boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" }}
                >
                  <div className="bg-gray-100 dark:bg-gray-900 hover:bg-gray-50 h-full w-full rounded-md transition-colors duration-200">
                    <div className="bg-clip-text text-transparent bg-hero-gradient text-sm md:text-base py-2 px-4 text-center font-medium">
                      View Dashboard
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Mobile-Optimized Stats */}
            <motion.div
              className="grid grid-cols-3 gap-2 md:gap-8 max-w-4xl mx-auto px-2"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              {[
                { value: "10x", label: "Faster Content Creation" },
                { value: "500+", label: "Happy Creators" },
                { value: "24/7", label: "AI-Powered Support" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.7 + index * 0.1 }}
                  whileHover={{ scale: 1.1, rotate: 2 }}
                >
                  <motion.div
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 md:mb-2"
                    whileHover={{ color: "#3b82f6" }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-xs sm:text-sm md:text-base text-muted-foreground leading-tight">
                    {stat.label.split(' ').map((word, i) => (
                      <span key={i} className="block">{word}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Floating Elements */}
        <motion.div
          className="absolute top-16 md:top-20 left-4 md:left-10 w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full shadow-lg"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        ></motion.div>

        <motion.div
          className="absolute bottom-16 md:bottom-20 right-4 md:right-10 w-10 h-10 md:w-12 md:h-12 bg-twitter/20 rounded-full shadow-lg"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
            rotate: [0, -180, -360]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>

        <motion.div
          className="absolute top-32 md:top-40 right-6 md:right-20 w-6 h-6 md:w-8 md:h-8 bg-instagram/20 rounded-full shadow-lg"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 360],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        ></motion.div>

        <motion.div
          className="absolute bottom-32 md:bottom-40 left-6 md:left-20 w-8 h-8 md:w-10 md:h-10 bg-linkedin/20 rounded-full shadow-lg"
          animate={{
            x: [0, 15, 0],
            y: [0, -10, 0],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        ></motion.div>

        <motion.div
          className="absolute top-48 md:top-60 left-1/4 w-4 h-4 md:w-6 md:h-6 bg-facebook/20 rounded-full shadow-lg"
          animate={{
            scale: [1, 0.8, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        ></motion.div>

        <motion.div
          className="absolute bottom-48 md:bottom-60 right-1/4 w-10 h-10 md:w-14 md:h-14 bg-primary/15 rounded-full shadow-lg"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 0.9, 1],
            borderRadius: ["50%", "20%", "50%"]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        ></motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="relative py-16 md:py-20 px-4 bg-gradient-to-b from-muted/40 via-background to-muted/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 -z-10 bg-grid-white/[0.05] dark:bg-grid-black/[0.05]" />

        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 md:mb-16 px-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Everything You Need to Succeed
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Powerful features designed to streamline your social media workflow and amplify your online presence.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.2
                }
              }
            }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 50, scale: 0.9 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        duration: 0.6
                      }
                    }
                  }}
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    rotate: 5,
                    borderRadius: "20px",
                    boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="group relative bg-background/60 backdrop-blur border border-border/40 rounded-2xl p-6 h-full hover:shadow-2xl transition-all duration-500 overflow-hidden">
                    {/* Animated background gradient on hover */}
                    <motion.div
                      className="absolute inset-0 bg-hero-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                      initial={false}
                    />

                    <CardHeader className="pb-4 relative z-10">
                      <motion.div
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-hero-gradient flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300"
                        whileHover={{
                          scale: 1.1,
                          rotate: 5,
                          boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)"
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                      </motion.div>
                      <CardTitle className="mt-4 text-xl md:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 relative z-10">
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </CardContent>

                    {/* Subtle floating particles */}
                    <motion.div
                      className="absolute top-4 right-4 w-2 h-2 bg-primary/20 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.8, 0.3]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    />
                    <motion.div
                      className="absolute bottom-4 left-4 w-1 h-1 bg-primary/30 rounded-full"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.2, 0.6, 0.2]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: index * 0.7
                      }}
                    />
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl md:text-5xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Why Choose Sync?
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of creators who've transformed their social media strategy
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3
                  }
                }
              }}
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-3 group"
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }
                    }
                  }}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  </motion.div>
                  <motion.p
                    className="text-lg text-foreground group-hover:text-primary transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    {benefit}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="bg-hero-gradient rounded-2xl p-8 text-white text-center relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.3)"
              }}
            >
              {/* Animated background particles */}
              <motion.div
                className="absolute top-4 right-4 w-3 h-3 bg-white/20 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
              <motion.div
                className="absolute bottom-4 left-4 w-2 h-2 bg-white/30 rounded-full"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.2, 0.6, 0.2]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 1
                }}
              />

              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="text-5xl font-bold mb-2"
                  whileHover={{ scale: 1.1, color: "#ffffff" }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  10x
                </motion.div>
                <div className="text-xl opacity-90">Faster Content Creation</div>
              </motion.div>

              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="text-3xl font-bold mb-2"
                  whileHover={{ scale: 1.1, color: "#ffffff" }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  500+
                </motion.div>
                <div className="text-lg opacity-90">Happy Creators</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <HeroButton
                  variant="hero-outline"
                  size="lg"
                  className="bg-white/20 border-white/30 hover:bg-white/30"
                  onClick={() => signIn("google")}
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Join Now
                  </motion.span>
                </HeroButton>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 bg-hero-gradient relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />

        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
          >
            Ready to Transform Your Social Media?
          </motion.h2>
          <motion.p
            className="text-xl mb-8 opacity-90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Start creating professional, engaging content that converts. No credit card required.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <HeroButton
                variant="hero-outline"
                size="xl"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => signIn("google")}
              >
                Get Started Free
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="ml-2 w-5 h-5" />
                </motion.div>
              </HeroButton>
            </motion.div>
          </motion.div>
          <motion.p
            className="text-sm opacity-80 mt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            ✨ Full functionality requires Supabase integration for AI features
          </motion.p>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="bg-card border-t py-12 px-4 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-5"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.05 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-hero-gradient"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            className="flex items-center justify-center space-x-2 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>
            <motion.span
              className="font-bold text-xl text-foreground"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Sync
            </motion.span>
          </motion.div>

          <motion.p
            className="text-muted-foreground mb-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            Empowering creators with AI-powered social media management
          </motion.p>

          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
          >
            © 2024 Sync | SyncMultiplePlatforms. Built with ❤️ for creators everywhere.
          </motion.p>

          {/* Floating particles in footer */}
          <motion.div
            className="absolute top-8 left-8 w-2 h-2 bg-primary/20 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity
            }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-3 h-3 bg-primary/15 rounded-full"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: 1
            }}
          />
        </div>
      </motion.footer>
    </motion.div>
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
