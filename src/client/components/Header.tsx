import React from "react";
import { Smartphone } from "lucide-react";

export function Header() {
  return (
    <header className="flex justify-between items-center mb-16">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
          <Smartphone className="text-white w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">AppLink</h1>
      </div>
    </header>
  );
}
