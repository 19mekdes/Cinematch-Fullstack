'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Film, Home, Heart, LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Film className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-800">CineMatch</span>
              </Link>
              
              {/* Navigation Links */}
              <div className="flex gap-4 items-center">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                
                {isLoggedIn && (
                  <Link
                    href="/watchlist"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="hidden sm:inline">Watchlist</span>
                  </Link>
                )}
                
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        {children}
      </body>
    </html>
  );
}