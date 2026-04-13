import React from 'react';
import s from './AIGlow.module.css';

interface AIGlowProps {
  opacity?: number;
}

const AIGlow: React.FC<AIGlowProps> = ({ opacity = 0.4 }) => {
  return (
    <div className={s.wrapper} style={{ opacity }}>
      <div className={s.blob + ' ' + s.blob1} />
      <div className={s.blob + ' ' + s.blob2} />
      <div className={s.blob + ' ' + s.blob3} />
      <div className={s.noise} />
    </div>
  );
};

export default AIGlow;
