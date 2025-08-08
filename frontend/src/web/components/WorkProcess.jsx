import React from 'react';

export default function WorkProcess() {
  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your free account in minutes — no documents, no hassle.",
      buttonText: "Sign Up →"
    },
    {
      number: "02", 
      title: "Deposit and Activate Bot",
      description: "Add funds and let our smart trading bot do the heavy lifting.",
      buttonText: "Deposit and Activate Bot →"
    },
    {
      number: "03",
      title: "Bot Trades Automatically 24/7", 
      description: "It finds price gaps between exchanges and makes trades in real-time.",
      buttonText: "Bot Trades →"
    },
    {
      number: "04",
      title: "Earn Daily Profits",
      description: "Watch your balance grow with consistent, low-risk returns.",
      buttonText: "Earn Daily Profits →"
    }
  ];

  return (
    <div id='process'
  className=" flex items-center justify-center sm:p-8 p-4 bg-black bg-opacity-80"
  style={{
    backgroundImage: `url('/process.png')`, // Replace with actual path
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>
  <div className="max-w-7xl w-full">
   <div className="text-center mb-12">
    <div className="inline-flex items-center space-x-2">
            <img src="/img8.svg" className="w-8"/>
            <span className="text-[#a5e881] font-semibold text-sm tracking-wider uppercase">
              Process
            </span>
             <img src="/img9.svg" className="w-8"/>
          </div>
  <h1 className="text-white text-3xl sm:text-4xl capitalize font-bold mb-1">
    How UniMeta Makes <span className="text-red-400">You Money Daily</span>
  </h1>
  <p className="text-gray-300 text-sm sm:text-lg font-medium max-w-2xl mx-auto">
    Our automated system uses crypto arbitrage to buy at a lower price and sell at a higher one — across trusted exchanges — so you earn profits every single day without lifting a finger.
  </p>
</div>


    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {steps.map((step, index) => (
        <div
          key={index}
          className="bg-black/40 border border-white/20 rounded-lg p-4 hover:bg-green-900/30 transition-colors duration-300"
        >
          <div className="text-[#a5e881] text-lg font-bold mb-2">
            {step.number}
          </div>

          <h3 className="text-[#a5e881] text-lg font-bold mb-1">
            {step.title}
          </h3>

          <p className="text-white text-base mb-6 leading-relaxed">
            {step.description}
          </p>

          <button className="text-[#a5e881] text-sm font-medium hover:text-[#7db65e] transition-colors duration-200">
            {step.buttonText}
          </button>
        </div>
      ))}
    </div>
  </div>
</div>

  );
}