"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { Menu, X } from "lucide-react";
import UpgradeButton from "./upgrade-button";

interface MobileMenuProps {
  user: any;
  userRole: string | null;
}

export default function MobileMenu({ user, userRole }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Close menu on left swipe (swipe to close)
    if (isLeftSwipe && isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="container mx-auto px-4 py-4 space-y-3">
            {user ? (
              <>
                {userRole !== 'premium' && (
                  <div className="py-2">
                    <UpgradeButton />
                  </div>
                )}
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50 min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <div className="py-2">
                  <UpgradeButton />
                </div>
                <Link
                  href="/sign-in"
                  className="block px-4 py-3 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50 min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
