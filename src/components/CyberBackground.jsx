import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const CyberBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 50, stiffness: 300 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      document.documentElement.style.setProperty("--x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    
    // Generate random sparks
    const newSparks = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setSparks(newSparks);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base Pattern from CSS */}
      <div className="pattern" />
      
      {/* Mouse Follow Glow */}
      <div className="mouse-glow" />

      {/* Floating Sparks */}
      {sparks.map((spark) => (
        <motion.div
          key={spark.id}
          initial={{ 
            opacity: 0, 
            x: `${spark.x}vw`, 
            y: `${spark.y}vh` 
          }}
          animate={{
            opacity: [0, 0.4, 0],
            y: [`${spark.y}vh`, `${spark.y - 20}vh`],
          }}
          transition={{
            duration: spark.duration,
            repeat: Infinity,
            delay: spark.delay,
            ease: "linear",
          }}
          style={{
            width: spark.size,
            height: spark.size,
            backgroundColor: "#FF3D3D",
            borderRadius: "50%",
            position: "absolute",
            boxShadow: "0 0 10px #FF3D3D",
          }}
        />
      ))}

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} 
      />
    </div>
  );
};

export default CyberBackground;
