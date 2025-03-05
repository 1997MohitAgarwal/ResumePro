import React from "react";

export default function Navbar() {
    return (
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img
            src="/assets/images/Ai.png"
            alt="App Logo"
            width={40}
            height={40}
          />
          <h1 className="text-xl text-rose-500 font-bold">
            Resume<span className="text-gray-800">Pro</span>
          </h1>
        </div>
      </nav>
    );
  }