import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'default';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    const base = 'px-4 py-2 rounded';
    const outline =
      variant === 'outline' ? 'border border-gray-300 bg-transparent' : '';
    const classes = `${base} ${outline} ${className}`.trim();
    return <button ref={ref} className={classes} {...props} />;
  }
);
Button.displayName = 'Button';

export default Button;

