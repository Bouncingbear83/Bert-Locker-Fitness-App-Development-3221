import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'stats' | 'exercise' | 'glass';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'base', hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base card styles
        'rounded-xl shadow-xl transition-all duration-200',
        
        // Variant styles
        {
          // Base card
          'bg-slate-900 border border-slate-700 shadow-slate-950/50 p-6': variant === 'base',
          
          // Stats card with pink accent
          'bg-slate-900 border border-slate-700 border-t-2 border-t-pink-500 shadow-slate-950/50 p-6 gradient-card': variant === 'stats',
          
          // Exercise card with hover effects
          'bg-slate-900 border border-slate-700 border-l-2 border-l-pink-500 shadow-slate-950/50 p-6 hover:shadow-2xl hover:shadow-pink-500/10 hover:scale-[1.02] cursor-pointer': variant === 'exercise',
          
          // Glass morphism card
          'glass-effect p-6': variant === 'glass',
        },
        
        // Hover effects
        hover && 'hover-lift cursor-pointer',
        
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 pb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
  }
>(({ className, level = 3, ...props }, ref) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return React.createElement(Component, {
    ref,
    className: cn(
      'font-bold leading-tight tracking-tight text-slate-50',
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

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-300 leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };