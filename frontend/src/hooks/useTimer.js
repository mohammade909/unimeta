import { useState, useEffect } from 'react';

export const useTimer = (createdAt, durationInDays = 7) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!createdAt) return;

    const createdAtDate = new Date(createdAt);
    const referenceDate = new Date("2025-02-08T00:00:00Z");
    
    if (createdAtDate < referenceDate) {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const timerDuration = durationInDays * 24 * 60 * 60 * 1000;
    const endDate = createdAtDate.getTime() + timerDuration;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true; // Timer expired
      }

      setTimeRemaining({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
      return false;
    };

    const timerInterval = setInterval(() => {
      const expired = calculateTimeRemaining();
      if (expired) {
        clearInterval(timerInterval);
      }
    }, 1000);

    // Initial calculation
    calculateTimeRemaining();

    return () => clearInterval(timerInterval);
  }, [createdAt, durationInDays]);

  return timeRemaining;
};