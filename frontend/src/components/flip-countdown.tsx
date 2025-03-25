import { useEffect, useState } from "react";

interface FlipCountdownProps {
  targetDate: Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function FlipCountdown({
  targetDate,
  className = "",
}: FlipCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Clean up
    return () => clearInterval(timer);
  }, [targetDate]);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, "0");
  };

  return (
    <div className={`flex justify-center gap-2 md:gap-4 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="bg-primary-foreground/10 rounded-lg p-2 md:p-3 w-16 md:w-20 text-center">
          <span className="text-2xl md:text-3xl font-mono font-bold">
            {formatNumber(timeLeft.days)}
          </span>
        </div>
        <span className="text-xs mt-1 text-primary-foreground/70">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary-foreground/10 rounded-lg p-2 md:p-3 w-16 md:w-20 text-center">
          <span className="text-2xl md:text-3xl font-mono font-bold">
            {formatNumber(timeLeft.hours)}
          </span>
        </div>
        <span className="text-xs mt-1 text-primary-foreground/70">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary-foreground/10 rounded-lg p-2 md:p-3 w-16 md:w-20 text-center">
          <span className="text-2xl md:text-3xl font-mono font-bold">
            {formatNumber(timeLeft.minutes)}
          </span>
        </div>
        <span className="text-xs mt-1 text-primary-foreground/70">Minutes</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary-foreground/10 rounded-lg p-2 md:p-3 w-16 md:w-20 text-center">
          <span className="text-2xl md:text-3xl font-mono font-bold">
            {formatNumber(timeLeft.seconds)}
          </span>
        </div>
        <span className="text-xs mt-1 text-primary-foreground/70">Seconds</span>
      </div>
    </div>
  );
}
