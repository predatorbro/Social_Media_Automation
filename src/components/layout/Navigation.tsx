"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Zap,
  Menu,
  X,
  Home,
  PenTool,
  Calendar,
  Users,
  BookOpen,
  Settings,
  ImageIcon,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  console.log(pathname)
  const { data: session, status } = useSession();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Create Content", href: "/create", icon: PenTool },
    { name: "Studio", href: "/studio", icon: ImageIcon },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Platforms", href: "/platforms", icon: Users },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={`bg-card/80 backdrop-blur-sm border-b w-full top-0 z-50 ${pathname == "/" ? "fixed" : "sticky"}`} >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 focus:outline-none">
              <div className="w-8 h-8 bg-hero-gradient rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground">SocialFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {session && navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center juscen gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${isActive(item.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <item.icon size={16} />
                <span className={isActive(item.href) ? "hidden" : ""}>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Medium Screen Navigation */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            {session && navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${isActive(item.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                <span className={isActive(item.href) ? "" : "hidden"}>{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <HeroButton variant="hero" size="sm" className="focus:outline-none" onClick={() => signIn("google")}>
                Get Started
              </HeroButton>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ">
            <ThemeToggle />
            {session ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="focus:outline-none"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center px-2 hover:bg-transparent focus:outline-none">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback>
                          {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-card/80 backdrop-blur-sm border-t">
          <div className="px-4 py-4 space-y-2">
            {session && navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${isActive(item.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navigation;
