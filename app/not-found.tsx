'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

import animation404 from '@/public/animations/404.json';
import animation404Two from '@/public/animations/404-2.json';
import animation404Three from '@/public/animations/404-3.json';

const animations = [
  animation404,
  animation404Two,
  animation404Three,
];

export default function NotFound() {
  const router = useRouter();

  const selectedAnimation = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * animations.length);
    return animations[randomIndex];
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7faff] px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          ease: 'easeOut',
        }}
        className="flex flex-col items-center text-center max-w-xl"
      >
        {/* Lottie Animation */}
        <div className="w-full max-w-[700px]">
          <Lottie
            animationData={selectedAnimation}
            loop
            autoplay
            className="w-full h-full"
          />
        </div>

        {/* Text */}
        <h1 className="mt-6 text-5xl md:text-6xl font-semibold tracking-tight text-[#111827]">
          Oops.
        </h1>

        <p className="mt-4 text-xl font-medium text-[#111827]">
          This link has left the chat.
        </p>

        <p className="mt-2 text-base md:text-lg text-[#64748b] max-w-md">
          The page you are looking for doesn't exist or may have been moved.
        </p>

        {/* Button */}
        <button
          onClick={() => router.back()}
          className="
            mt-8
            rounded-full
            px-8
            py-3
            bg-[#0b65f3]
            text-white
            font-medium
            transition-all
            duration-300
            hover:bg-[#0955cc]
            hover:scale-105
            shadow-lg
            shadow-[#0b65f3]/20
          "
        >
          Go Back
        </button>
      </motion.div>
    </main>
  );
}