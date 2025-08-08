
import React from 'react';
import { useAnimatedCounter } from '@/hooks/use-landing-hooks';

const AnimatedCounter = ({ value, label, suffix = '' }) => {
  const [ref, count] = useAnimatedCounter(value);

  return (
    <div ref={ref} className="text-center">
      <div className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-lg text-white/70">{label}</div>
    </div>
  );
};

const InteractiveStats = () => {
  const stats = [
    { value: 15000, label: "Projects Created", suffix: "+" },
    { value: 99, label: "Uptime", suffix: "%" },
    { value: 10, label: "AI Tools", suffix: "+" },
  ];

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <AnimatedCounter
              key={index}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveStats;
