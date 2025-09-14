import { useEffect, useState } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: "--",
    hours: "--",
    minutes: "--",
    seconds: "--",
  });

  useEffect(() => {
    const targetDate = new Date("2026-03-02T00:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
      } else {
        const days = String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, "0");
        const hours = String(
          Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        ).padStart(2, "0");
        const minutes = String(
          Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        ).padStart(2, "0");
        const seconds = String(Math.floor((difference % (1000 * 60)) / 1000)).padStart(2, "0");

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="">
      <div className="flex items-center justify-center gap-3 sm:gap-6 bg-white/10 backdrop-blur-sm px-3 sm:px-5 py-2 rounded-lg shadow-lg">
        {/* Days */}
        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-2xl font-bold">{timeLeft.days}</span>
          <span className="text-[10px] sm:text-xs uppercase text-gray-200">days</span>
        </div>

        <span className="text-lg sm:text-2xl font-bold text-gray-300">:</span>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-2xl font-bold">{timeLeft.hours}</span>
          <span className="text-[10px] sm:text-xs uppercase text-gray-200">hours</span>
        </div>

        <span className="text-lg sm:text-2xl font-bold text-gray-300">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-2xl font-bold">{timeLeft.minutes}</span>
          <span className="text-[10px] sm:text-xs uppercase text-gray-200">minutes</span>
        </div>

        <span className="text-lg sm:text-2xl font-bold text-gray-300">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <span className="text-lg sm:text-2xl font-bold">{timeLeft.seconds}</span>
          <span className="text-[10px] sm:text-xs uppercase text-gray-200">seconds</span>
        </div>
      </div>
    </div>
  );
}
