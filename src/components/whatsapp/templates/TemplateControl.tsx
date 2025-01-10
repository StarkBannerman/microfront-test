import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ValidationResult } from '@/lib/templateUtils'

interface TemplateControlProps {
  pageMode: 'view' | 'edit' | 'create'
  template: {
    name: string
    language: string
    category: string
  }
  errors: ValidationResult[]
  nameError: { message: string; mode?: string } | null
  changeName: (e: React.ChangeEvent<HTMLInputElement>) => void
  changeLanguage: (value: string) => void
  changeCategory: (value: string) => void
  createTemplateInfo: () => void
  updateTemplateInfo: () => void
  changed: boolean
  navigateToPageMode: (mode: 'view' | 'edit' | 'create') => void
}

export default function TemplateControl({
  pageMode,
  template,
  errors,
  nameError,
  changeName,
  changeLanguage,
  changeCategory,
  createTemplateInfo,
  updateTemplateInfo,
  changed,
  navigateToPageMode,
}: TemplateControlProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label htmlFor="template-name" className="text-sm font-medium">
            Template Name
          </label>
          <Input
            id="template-name"
            placeholder="Enter template name"
            value={template.name}
            onChange={changeName}
            disabled={pageMode === 'view'}
          />
          {nameError && (
            <p className="text-sm text-red-500">{nameError.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-medium">
            Language
          </label>
          <Select
            value={template.language}
            onValueChange={changeLanguage}
            disabled={pageMode === 'view'}
          >
            <SelectTrigger id="language">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Select
            value={template.category}
            onValueChange={changeCategory}
            disabled={pageMode === 'view'}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pageMode !== 'view' && (
        <div className="flex justify-end">
          <Button
            onClick={
              pageMode === 'create' ? createTemplateInfo : updateTemplateInfo
            }
            disabled={pageMode === 'edit' && !changed}
          >
            {pageMode === 'create' ? 'Create Template' : 'Update Template'}
          </Button>
        </div>
      )}

      {errors.map(
        (error, key) =>
          ['name', 'language', 'category'].includes(error.type) &&
          !error.isValid && (
            <Alert key={key} variant="destructive">
              <AlertDescription>
                <ul className="list-disc pl-4">
                  <li>{error.type.toUpperCase()} cannot be empty.</li>
                </ul>
              </AlertDescription>
            </Alert>
          ),
      )}
    </div>
  )
}
