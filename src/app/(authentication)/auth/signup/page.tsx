'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff } from 'lucide-react'
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
import { Banner } from '@/components/auth/Banner'
import { useSearchParams } from 'next/navigation'

interface SignUpFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  organizationName: string
}

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>()

  const password = watch('password', '')

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.match(/[a-z]/)) strength += 10
    if (password.match(/[A-Z]/)) strength += 15
    if (password.match(/\d/)) strength += 25
    if (password.match(/[^a-zA-Z\d]/)) strength += 25
    return Math.min(strength, 100)
  }

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength >= 80) return 'Strong'
    if (strength >= 50) return 'Medium'
    return 'Weak'
  }

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength >= 80) return 'bg-green-500'
    if (strength >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const onSubmit = async (data: SignUpFormData) => {
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { token: token }),
          },
          body: JSON.stringify(data),
        },
      )

      if (response.status === 200) {
        const result = await response.json()
        console.log('Registration successful:', result)

        // Automatically sign in the user
        const signInResult = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (signInResult?.error) {
          console.log('Sign-in error:', signInResult.error)
          setError(
            'Registration successful, but there was an error signing in. Please try signing in manually.',
          )
        } else {
          // Redirect to the onboarding page
          router.push('/onboarding/messaging-platforms')
        }
      } else {
        const errorData = await response.json()
        setError(
          errorData.message ||
            'An error occurred during registration. Please try again.',
        )
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExternalLogin = async (provider: string) => {
    try {
      const result = await signIn(provider, {
        callbackUrl: '/onboarding/marketplace',
        redirect: false,
      })
      if (result?.error) {
        console.error(`${provider} sign-up error:`, result.error)
        setError(`Failed to sign up with ${provider}. Please try again.`)
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error(`Unexpected error during ${provider} sign-up:`, error)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Banner
        testimonial="Mercuri has revolutionized our customer engagement strategy. The SMS and WhatsApp campaigns have significantly boosted our response rates and customer satisfaction."
        author="Sarah Johnson"
        authorTitle="Marketing Director"
      />

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Create Your Mercuri Account
            </CardTitle>
            <CardDescription className="text-center">
              Start optimizing your SMS and WhatsApp campaigns today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter First Name"
                    {...register('firstName', {
                      required: 'First Name is required',
                    })}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter Last Name"
                    {...register('lastName', {
                      required: 'Last Name is required',
                    })}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@company.com"
                  {...register('email', { required: 'Email is required' })}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  placeholder="Enter Organization Name"
                  {...register('organizationName', {
                    required: 'Organization Name is required',
                  })}
                  disabled={isLoading}
                />
                {errors.organizationName && (
                  <p className="text-sm text-destructive">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                      onChange: (e) =>
                        setPasswordStrength(
                          calculatePasswordStrength(e.target.value),
                        ),
                    })}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
                <div className="space-y-2 mt-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Password strength:{' '}
                    <span
                      className={`font-medium ${getPasswordStrengthColor(passwordStrength).replace('bg-', 'text-')}`}
                    >
                      {getPasswordStrengthLabel(passwordStrength)}
                    </span>
                  </p>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleExternalLogin('google')}
                className="w-full"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_13183_10121)">
                    <path
                      d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z"
                      fill="#3F83F8"
                    />
                    <path
                      d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z"
                      fill="#FBBC04"
                    />
                    <path
                      d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z"
                      fill="#EA4335"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_13183_10121">
                      <rect
                        width="20"
                        height="20"
                        fill="white"
                        transform="translate(0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleExternalLogin('azure-ad')}
                className="w-full"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_13183_10125)">
                    <path
                      d="M9.57048 4.23525H4.23524V9.57049H9.57048V4.23525Z"
                      fill="#F25022"
                    />
                    <path
                      d="M15.7646 4.23525H10.4294V9.57049H15.7646V4.23525Z"
                      fill="#7FBA00"
                    />
                    <path
                      d="M9.57048 10.4294H4.23524V15.7646H9.57048V10.4294Z"
                      fill="#00A4EF"
                    />
                    <path
                      d="M15.7646 10.4294H10.4294V15.7646H15.7646V10.4294Z"
                      fill="#FFB900"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_13183_10125">
                      <rect
                        width="20"
                        height="20"
                        fill="white"
                        transform="translate(0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
                Microsoft
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Already have an account?{' '}
              <a
                href="/auth/signin"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
