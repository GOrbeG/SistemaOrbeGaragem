// frontend/src/components/ui/Card.tsx

import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>; // <— permite clique
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx("bg-white rounded-xl shadow-md p-4", className)}
    >
      {children}
    </div>
  );
};

export default Card;
