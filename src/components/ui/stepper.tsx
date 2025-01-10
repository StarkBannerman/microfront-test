import React from 'react'
import { cn } from '@/lib/utils'

type StepperProps = {
  activeStep: number
  orientation?: 'horizontal' | 'vertical'
  children: React.ReactNode
}

type StepProps = {
  children: React.ReactNode
  stepNumber?: number
  isActive?: boolean
}

type StepLabelProps = {
  children: React.ReactNode
}

type StepContentProps = {
  children: React.ReactNode
}

export const Stepper = ({
  activeStep,
  orientation = 'vertical',
  children,
}: StepperProps) => {
  const steps = React.Children.toArray(children)

  return (
    <div
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col space-y-4' : 'space-x-4',
      )}
    >
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            'flex',
            orientation === 'vertical' ? 'flex-col' : 'items-center',
          )}
        >
          {React.cloneElement(step as React.ReactElement<StepProps>, {
            stepNumber: index + 1,
            isActive: index === activeStep,
          })}
        </div>
      ))}
    </div>
  )
}

export const Step = ({ children, stepNumber, isActive }: StepProps) => {
  return (
    <div
      className={cn(
        'flex items-start space-x-4',
        isActive ? 'text-primary' : 'text-muted-foreground',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2',
          isActive
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground',
        )}
      >
        {stepNumber}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export const StepLabel = ({ children }: StepLabelProps) => {
  return <div className="text-base font-medium">{children}</div>
}

export const StepContent = ({ children }: StepContentProps) => {
  return <div className="mt-2 ml-12">{children}</div>
}