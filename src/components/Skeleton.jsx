import React from "react";

const MovieSkeleton = () => {
  return (
    <div className="movie-card animate-pulse">
      <div className="relative rounded-2xl overflow-hidden aspect-[2/3] bg-white/5 border border-white/5">
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
      </div>
      
      <div className="mt-4 flex flex-col gap-3">
        <div className="h-4 bg-white/5 rounded-md w-3/4" />
        <div className="flex items-center gap-2">
           <div className="w-3 h-3 bg-white/5 rounded-full" />
           <div className="h-3 bg-white/5 rounded-md w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const TrendingSkeleton = () => {
  return (
    <div className="flex items-center gap-6 animate-pulse p-4">
      <div className="w-20 h-32 bg-white/5 rounded-3xl shrink-0" />
      <div className="flex flex-col gap-4 flex-1">
        <div className="h-6 bg-white/5 rounded-md w-1/2" />
        <div className="h-4 bg-white/5 rounded-md w-1/4" />
      </div>
    </div>
  );
};

export default MovieSkeleton;
