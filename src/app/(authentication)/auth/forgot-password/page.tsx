'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || 'http://localhost:3000'

type ForgotPasswordFormData = {
  email: string;
}

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<'success' | 'error'>('error')
  const [showLoginOption, setShowLoginOption] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>()

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(`${SERVER_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (response.ok) {
        setMessage(
          'An email with reset instructions has been sent to your registered email address',
        )
        setSeverity('success')
        setShowLoginOption(true)
      } else if (response.status === 201) {
        setMessage(
          'We could not find an account associated with the provided email',
        )
        setSeverity('error')
      } else {
        throw new Error('An error occurred')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      setSeverity('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive password reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {message && (
              <Alert variant={severity === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address',
                  },
                })}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Email...
                </>
              ) : (
                'Send Email'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {showLoginOption && (
            <Button
              variant="link"
              className="text-sm text-center text-muted-foreground"
              onClick={() => router.push('/login')}
            >
              Click here to login
            </Button>
          )}
          <div className="text-sm text-center text-muted-foreground">
            Remember your password?{' '}
            <a
              href="/auth/signin"
              className="hover:text-primary underline underline-offset-4"
            >
              Sign in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
