import React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, variant = 'base', hover = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base card styles
      'rounded-xl shadow-xl transition-all duration-200',

      // Variant styles
      {
        // Base card - Better contrast
        'bg-slate-800 border border-slate-600 shadow-slate-900/50 p-6': variant === 'base',
        // Stats card with pink accent - Better contrast
        'bg-slate-800 border border-slate-600 border-t-2 border-t-pink-500 shadow-slate-900/50 p-6': variant === 'stats',
        // Exercise card with hover effects - Better contrast
        'bg-slate-800 border border-slate-600 border-l-2 border-l-pink-500 shadow-slate-900/50 p-6 hover:shadow-2xl hover:shadow-pink-500/10 hover:scale-[1.02] cursor-pointer': variant === 'exercise',
        // Glass morphism card - Better contrast
        'bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 p-6': variant === 'glass',
      },

      // Hover effects
      hover && 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer',
      className
    )}
    {...props}
  />
));

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 pb-4', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, level = 3, ...props }, ref) => {
  const Component = `h${level}`;
  return React.createElement(Component, {
    ref,
    className: cn(
      'font-bold leading-tight tracking-tight text-slate-100',
      {
        'text-3xl': level === 1,
        'text-2xl': level === 2,
        'text-xl': level === 3,
        'text-lg': level === 4,
        'text-base': level === 5,
        'text-sm': level === 6,
      },
      className
    ),
    ...props,
  });
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-200 leading-relaxed', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between pt-4', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };