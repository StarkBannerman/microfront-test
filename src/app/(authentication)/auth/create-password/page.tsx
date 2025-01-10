'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Eye, EyeOff,Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const SERVER_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_BASE_URL || 'http://localhost:3000'

export default function SetPassword() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await axios.post(
          `${SERVER_BASE_URL}/auth/verify-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        if (response.status === 200) {
          setIsTokenValid(true)
        } else {
          setIsTokenValid(false)
        }
      } catch (error) {
        console.error('Error validating token:', error)
        setIsTokenValid(false)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      validateToken()
    } else {
      setLoading(false)
      setIsTokenValid(false)
    }
  }, [token])

  const handleCreatePassword = async () => {
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
    } else if (password.length < 8) {
      setError('Password must be at least 8 characters long')
    } else {
      await createPassword()
    }
  }

  async function createPassword() {
    try {
      setLoading(true)
      const response = await axios.post(
        `${SERVER_BASE_URL}/auth/create-password`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Password': password, // Send password in custom header
          },
        },
      )

      if (response.status === 200) {
        router.push(`/auth/signin`)
      } else {
        setError('Failed to create password. Please try again.')
      }
    } catch (error) {
      console.error('Error creating password:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Invite expired or invalid token</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md bg-white border border-gray-200">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold text-center text-black mb-6">
            Create password
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              onClick={handleCreatePassword}
              className="w-full bg-black hover:bg-black/90 text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading ? 'Creating...' : 'Create Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
