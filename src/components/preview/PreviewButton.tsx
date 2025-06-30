
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { usePreview } from '@/contexts/PreviewContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PreviewButtonProps extends ButtonProps {
  children: React.ReactNode;
  onPreviewClick?: () => void;
}

export function PreviewButton({ 
  children, 
  onClick, 
  onPreviewClick,
  disabled,
  ...props 
}: PreviewButtonProps) {
  const { isInPreview } = usePreview();
  
  const isDisabled = disabled || isInPreview;
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isInPreview) {
      e.preventDefault();
      onPreviewClick?.();
      return;
    }
    onClick?.(e);
  };

  const buttonElement = (
    <Button
      {...props}
      disabled={isDisabled}
      onClick={handleClick}
      className={isInPreview ? `${props.className} opacity-60` : props.className}
    >
      {children}
    </Button>
  );

  if (isInPreview) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonElement}
        </TooltipTrigger>
        <TooltipContent>
          <p>Disabled in preview mode</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonElement;
}
