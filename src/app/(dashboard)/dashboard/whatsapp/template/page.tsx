'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import TemplateControl from '@/components/whatsapp/templates/TemplateControl'
import TemplateHeader from '@/components/whatsapp/templates/TemplateHeader'
import TemplateBody from '@/components/whatsapp/templates/TemplateBody'
import TemplateFooter from '@/components/whatsapp/templates/TemplateFooter'
import TemplateButton from '@/components/whatsapp/templates/TemplateButton'
import { TemplatePreview } from '@/components/whatsapp/templates/TemplatePreview'
import FileUploadProgress from '@/components/FileUploadProgress'
import {
  ButtonComponent,
  buttonsGroupings,
  findDifferences,
  maxTemplateButtons,
  removeVariables,
  serializeTextMappingsAndSubstitutions,
  templateButtonsDictionary,
  validateTemplate,
  ValidationResult,
  WhatsappTemplate,
  Substitution,
  TextFormatter,
  Button,
} from '@/lib/templateUtils'
import {
  getTemplate,
  createTemplate,
  updateTemplate,
  getExistingTemplateNames,
} from '@/lib/whatsappServices'

type TemplateVariables = {
  text: string
  value: string
}
const customVariables: TemplateVariables[] = [
  { text: 'Business Name', value: 'businessName' },
  { text: 'First Name', value: 'firstName' },
  { text: 'Last Name', value: 'lastName' },
  { text: 'Phone', value: 'phone' },
  { text: 'Email', value: 'email' },
  { text: 'Phone Number', value: 'phoneNumber' },
  { text: 'Customer Name', value: 'customerName' },
  { text: 'Coupon Code', value: 'couponCode' },
]

const handleHeaderAndFooterComponent = (component: any, newFormat: string) => {
  if (newFormat === 'NONE') {
    return {
      type: component.type,
      format: 'NONE',
      text: '',
      mappings: {},
      substitutions: [],
    }
  } else if (newFormat === 'TEXT') {
    return {
      type: component.type,
      mappings: {},
      substitutions: [],
      format: 'TEXT',
      text: '',
    }
  } else if (newFormat === 'MEDIA') {
    return {
      type: component.type,
      mappings: {},
      substitutions: [],
      format: 'MEDIA',
      subFormat: '',
    }
  } else {
    return component
  }
}

export default function WhatsappTemplateManagement() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pageMode, setPageMode] = useState<'view' | 'edit' | 'create'>('view')
  const selectedMode = searchParams.get('mode')
  const templateId = searchParams.get('templateId')

  const [loading, setLoading] = useState(false)
  const [oldTemplate, setOldTemplate] = useState<WhatsappTemplate | any[]>([])
  const [template, setTemplate] = useState<WhatsappTemplate>({
    templateId: '',
    accountId: '',
    organizationId: '',
    name: '',
    language: '',
    category: '',
    status: '',
    createdAt: '',
    updatedAt: '',
    components: [
      { type: 'HEADER', format: 'NONE' },
      { type: 'BODY', text: '', mappings: null, substitutions: [] },
      { type: 'FOOTER', format: 'NONE' },
      { type: 'BUTTONS', buttons: [] },
    ],
  })
  const [nameError, setNameError] = useState<{
    mode: string
    message: string
  } | null>(null)
  const [existingTemplateNames, setExistingTemplateNames] = useState<string[]>(
    [],
  )
  const [templateVariables, setTemplateVariables] =
    useState<TemplateVariables[]>(customVariables)
  const [file, setFile] = useState<File | null>(null)
  const [changed, setChanged] = useState<boolean>(false)
  const [errors, setErrors] = useState<ValidationResult[]>([])
  const [showProgress, setShowProgress] = useState<boolean>(false)
  const [fileUploadProgress, setFileUploadProgress] = useState<number>(0)

  const accountId = searchParams.get('accountId') as string

  const checkForChanges = () => {
    const differences = findDifferences(oldTemplate, template)
    return Object.keys(differences).length > 0
  }

  const onFileUploadProgress = useCallback((percent: number) => {
    setFileUploadProgress(percent)
    if (percent === 100) {
      setTimeout(() => {
        setShowProgress(false)
        setFileUploadProgress(0)
      }, 1000)
    }
  }, [])

  const navigateToPageMode = useCallback(
    (mode: string) => {
      if (mode === 'create') {
        router.push(`/dashboard/whatsapp/template?mode=create`)
      } else {
        router.push(
          `/dashboard/whatsapp/template?templateId=${templateId}&mode=${mode}`,
        )
      }
    },
    [router, templateId],
  )

  const changeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (pageMode === 'create') {
        let inputValue = e.target.value
        inputValue = inputValue.toLowerCase()
        const updatedName: string = inputValue
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')
        if (
          updatedName === 'test' ||
          existingTemplateNames.includes(updatedName)
        ) {
          setNameError(
            updatedName === 'test'
              ? {
                  mode: 'test',
                  message: `The template name "test" requires the body text to be "Hello {{1}}". To use a different body text, please change the template name.`,
                }
              : {
                  mode: 'duplicate',
                  message: `The template name "${updatedName}" is already in use. Please choose a different name.`,
                },
          )
        } else {
          setNameError(null)
        }
        setTemplate((oldTemplate) => ({
          ...oldTemplate,
          name: updatedName,
        }))
      }
    },
    [pageMode, existingTemplateNames],
  )

  const changeLanguage = useCallback((value: string) => {
    setTemplate((oldTemplate) => ({
      ...oldTemplate,
      language: value,
    }))
  }, [])

  const changeCategory = useCallback((value: string) => {
    setTemplate((oldTemplate) => ({
      ...oldTemplate,
      category: value,
    }))
  }, [])

  const createTemplateInfo = useCallback(async () => {
    const validator = validateTemplate(template)
    setErrors(validator.components)
    if (validator.isValid) {
      if (file !== null) setShowProgress(true)
      const response = await createTemplate(
        accountId,
        template,
        file,
        onFileUploadProgress,
      )
      if (response.status === 200) {
        router.push(`/dashboard/whatsapp/templatelist`)
      } else {
        setShowProgress(false)
        setFileUploadProgress(0)
      }
    }
  }, [template, file, router, accountId, onFileUploadProgress])

  const updateTemplateInfo = useCallback(async () => {
    const isChanged = checkForChanges()
    if (isChanged) {
      const validator = validateTemplate(template)
      setErrors(validator.components)
      if (validator.isValid) {
        if (file !== null) setShowProgress(true)
        const finalTemplate = removeVariables(template)
        const response = await updateTemplate(
          finalTemplate,
          file,
          onFileUploadProgress,
        )
        if (response.status === 200) {
          router.push(`/dashboard/whatsapp/templatelist`)
        } else {
          setShowProgress(false)
          setFileUploadProgress(0)
        }
      }
    }
  }, [template, file, router, onFileUploadProgress, checkForChanges])

  const handleFormatChange = useCallback(
    (componentType: string, newFormat: string) => {
      setTemplate((oldTemplate) => {
        const updatedComponents = oldTemplate.components.map((component) =>
          component?.type === componentType
            ? handleHeaderAndFooterComponent(component, newFormat)
            : component,
        )
        return {
          ...oldTemplate,
          components: updatedComponents,
        }
      })
    },
    [],
  )

  const handleHeaderSubFormatChange = useCallback((newSubFormat: string) => {
    setFile(null)
    setTemplate((oldTemplate) => {
      const updatedComponents = oldTemplate.components.map((component) =>
        component?.type === 'HEADER'
          ? {
              ...component,
              subFormat: newSubFormat,
              formatType: 'STATIC',
              mappings:
                newSubFormat === 'LOCATION'
                  ? { LATITUDE: '', LONGITUDE: '', NAME: '', ADDRESS: '' }
                  : { [newSubFormat]: '' },
              substitutions:
                newSubFormat !== 'LOCATION' ? [''] : ['', '', '', ''],
            }
          : component,
      )
      return {
        ...oldTemplate,
        components: updatedComponents,
      }
    })
  }, [])

  const handleHeaderFormatTypeChange = useCallback((newFormatType: string) => {
    setTemplate((oldTemplate) => {
      const updatedComponents = oldTemplate.components.map((component) =>
        component?.type === 'HEADER'
          ? { ...component, formatType: newFormatType }
          : component,
      )
      return {
        ...oldTemplate,
        components: updatedComponents,
      }
    })
  }, [])

  // const handleTextChange = useCallback((componentType:string, newText:string) => {
  //   setTemplate((oldTemplate) => ({
  //     ...oldTemplate,
  //     components: oldTemplate.components.map((component) => {
  //       if (component.type === componentType) {
  //         const updatedComponent = {
  //           ...component,
  //           ...serializeTextMappingsAndSubstitutions(
  //             component.type,
  //             newText,
  //             component?.mappings ?? {},
  //             component?.substitutions ?? [],
  //           ),
  //         }
  //         return updatedComponent
  //       }
  //       return component
  //     }),
  //   }))
  // }, [])

  const handleTextChange = useCallback(
    (componentType: string, newText: string) => {
      setTemplate((oldTemplate) => {
        const updatedComponents = oldTemplate.components.map((component) => {
          if (component?.type === componentType) {
            const updatedComponent = {
              ...component,
              ...serializeTextMappingsAndSubstitutions(
                component.type,
                newText,
                component?.mappings ?? {},
                component?.substitutions ?? [],
              ),
            }
            return updatedComponent
          }
          return component
        })

        return {
          ...oldTemplate,
          components: updatedComponents,
        }
      })
    },
    [],
  )

  const handleAddVariable = useCallback((componentType: string) => {
    setTemplate((oldTemplate) => {
      const component = oldTemplate.components.find(
        (c) => c?.type === componentType,
      )
      if (!component) return oldTemplate

      const variable = Object.keys(component.mappings || {}).length
      const newText = `${component.text}{{${variable + 1}}}`

      return {
        ...oldTemplate,
        components: oldTemplate.components.map((c) =>
          c?.type === componentType
            ? {
                ...c,
                text: newText,
                mappings: { ...(c?.mappings || {}), [variable + 1]: '' },
                substitutions: [...(c?.substitutions || []), ''],
              }
            : c,
        ),
      }
    })
  }, [])

  const handleMappingValueChange = useCallback(
    (componentType: string, key: string, newValue: string) => {
      setTemplate((oldTemplate) => ({
        ...oldTemplate,
        components: oldTemplate.components.map((component) =>
          component?.type === componentType
            ? {
                ...component,
                mappings: { ...component.mappings, [key]: newValue },
              }
            : component,
        ),
      }))
    },
    [],
  )

  const handleSubstitutionValueChange = useCallback(
    (componentType: string, valueIndex: number, newValue: Substitution) => {
      setTemplate((oldTemplate) => {
        const updatedTemplate = {
          ...oldTemplate,
          components: oldTemplate.components.map((component) => {
            if (component?.type === componentType) {
              const newSubstitutions: Substitution[] = [
                ...(component?.substitutions || []),
              ]
              if (valueIndex >= newSubstitutions.length) {
                while (newSubstitutions.length <= valueIndex) {
                  newSubstitutions.push(null)
                }
                newSubstitutions[valueIndex] = newValue
              } else {
                newSubstitutions[valueIndex] = newValue
              }
              return {
                ...component,
                substitutions: newSubstitutions,
              }
            }
            return component
          }),
        }
        return updatedTemplate
      })
    },
    [],
  )

  const handleHeaderSubstitutionValueChangeOnFileRemove = useCallback(() => {
    setTemplate((oldTemplate) => ({
      ...oldTemplate,
      components: oldTemplate.components.map((component) =>
        component?.type === 'HEADER'
          ? {
              ...component,
              substitutions: [''],
              file: undefined,
            }
          : component,
      ),
    }))
  }, [])

  const handleTextFormattersClick = useCallback(
    (componentType: string, format: TextFormatter) => {
      setTemplate((oldTemplate) => {
        const component = oldTemplate.components.find(
          (c) => c?.type === componentType,
        )
        if (!component) return oldTemplate

        const formats: Record<TextFormatter, string> = {
          bold: '**',
          italics: '__',
          strikethrough: '~~',
          monospace: '``',
        }

        const newText = `${component.text || ''}${formats[format]}text${formats[format]}`

        return {
          ...oldTemplate,
          components: oldTemplate.components.map((c) =>
            c?.type === componentType ? { ...c, text: newText } : c,
          ),
        }
      })
    },
    [],
  )

  const handleAddButton = useCallback((firstGroup: string, type: string) => {
    const addableGroup = Object.keys(buttonsGroupings).find((group) =>
      buttonsGroupings[group].includes(type),
    )
    if (!addableGroup) {
      alert('Invalid Button Type.')
      return
    }

    setTemplate((oldTemplate) => {
      let buttonsComponent = oldTemplate.components.find(
        (component) => component?.type === 'BUTTONS',
      ) as ButtonComponent | undefined

      if (!buttonsComponent) {
        buttonsComponent = { type: 'BUTTONS', buttons: [] }
        oldTemplate.components.push(buttonsComponent)
      }

      if (buttonsComponent.buttons.length >= maxTemplateButtons) {
        alert('Maximum number of buttons reached.')
        return oldTemplate
      }
      const buttonTypeCounts = buttonsComponent.buttons.reduce(
        (acc: Record<string, number>, button) => {
          acc[button.type] = (acc[button.type] || 0) + 1
          return acc
        },
        {},
      )
      const maxAllowed: number = templateButtonsDictionary[type]
        .maximum as number
      if (buttonTypeCounts[type] >= maxAllowed) {
        alert(`Maximum number of ${type} buttons reached.`)
        return oldTemplate
      }

      const currentGroupButtons = buttonsComponent.buttons.filter((button) =>
        buttonsGroupings[firstGroup].includes(button.type),
      )
      const otherGroupButtons = buttonsComponent.buttons.filter(
        (button) => !buttonsGroupings[firstGroup].includes(button.type),
      )

      if (firstGroup === addableGroup) {
        currentGroupButtons.push(
          templateButtonsDictionary[type].dataFormat as Button,
        )
      } else {
        otherGroupButtons.push(
          templateButtonsDictionary[type].dataFormat as Button,
        )
      }
      const updatedComponents = oldTemplate.components.map((component) =>
        component?.type === 'BUTTONS'
          ? {
              ...component,
              buttons: [...currentGroupButtons, ...otherGroupButtons],
            }
          : component,
      )
      return {
        ...oldTemplate,
        components: updatedComponents,
      }
    })
  }, [])

  const handleRemoveButton = useCallback(
    (currentGroup: string, removableGroup: string, buttonIndex: number) => {
      if (buttonIndex < 0) {
        return
      }
      setTemplate((oldTemplate) => {
        const buttonsComponent = oldTemplate.components.find(
          (component) => component?.type === 'BUTTONS',
        ) as ButtonComponent
        if (!buttonsComponent || !buttonsComponent.buttons) return oldTemplate
        const currentGroupButtons = buttonsComponent.buttons.filter((button) =>
          buttonsGroupings[currentGroup].includes(button.type),
        )
        const otherGroupButtons = buttonsComponent.buttons.filter(
          (button) => !buttonsGroupings[currentGroup].includes(button.type),
        )

        if (currentGroup === removableGroup) {
          currentGroupButtons.splice(buttonIndex, 1)
        } else {
          otherGroupButtons.splice(buttonIndex, 1)
        }
        const updatedComponents = oldTemplate.components.map((component) =>
          component?.type === 'BUTTONS'
            ? {
                ...component,
                buttons: [...currentGroupButtons, ...otherGroupButtons],
              }
            : component,
        )
        return {
          ...oldTemplate,
          components: updatedComponents,
        }
      })
    },
    [],
  )

  const handleMoveButtonInDirection = useCallback(
    (
      currentGroup: string,
      movableGroup: string,
      buttonIndex: number,
      direction: number,
    ) => {
      if (![1, -1].includes(direction)) return
      if (buttonIndex < 0) {
        return
      }
      setTemplate((oldTemplate) => {
        const buttonsComponent = oldTemplate.components.find(
          (component) => component?.type === 'BUTTONS',
        ) as ButtonComponent
        if (!buttonsComponent || !buttonsComponent.buttons) return oldTemplate
        const currentGroupButtons = buttonsComponent.buttons.filter((button) =>
          buttonsGroupings[currentGroup].includes(button.type),
        )
        const otherGroupButtons = buttonsComponent.buttons.filter(
          (button) => !buttonsGroupings[currentGroup].includes(button.type),
        )
        let newIndex = buttonIndex + direction
        let movableButton = null
        if (currentGroup === movableGroup) {
          movableButton = currentGroupButtons.splice(buttonIndex, 1)[0]
          currentGroupButtons.splice(newIndex, 0, movableButton)
        } else {
          movableButton = otherGroupButtons.splice(buttonIndex, 1)[0]
          otherGroupButtons.splice(newIndex, 0, movableButton)
        }
        const updatedComponents = oldTemplate.components.map((component) =>
          component?.type === 'BUTTONS'
            ? {
                ...component,
                buttons: [...currentGroupButtons, ...otherGroupButtons],
              }
            : component,
        )
        return {
          ...oldTemplate,
          components: updatedComponents,
        }
      })
    },
    [],
  )

  const handleSwapButtonGroup = useCallback((currentGroup: string) => {
    setTemplate((oldTemplate) => {
      const buttonsComponent = oldTemplate.components.find(
        (component) => component?.type === 'BUTTONS',
      ) as ButtonComponent
      if (!buttonsComponent || !buttonsComponent.buttons) return oldTemplate
      const currentGroupButtons: Button[] = []
      const newGroupButtons: Button[] = []
      buttonsComponent.buttons.forEach((button) => {
        if (buttonsGroupings[currentGroup].includes(button.type)) {
          currentGroupButtons.push(button)
        } else {
          newGroupButtons.push(button)
        }
      })
      const updatedComponents = oldTemplate.components.map((component) =>
        component?.type === 'BUTTONS'
          ? {
              ...component,
              buttons: [...newGroupButtons, ...currentGroupButtons],
            }
          : component,
      )
      return {
        ...oldTemplate,
        components: updatedComponents,
      }
    })
  }, [])

  const handleButtonTypeChange = useCallback(
    (group: string, buttonIndex: number, newType: string) => {
      const groups = buttonsGroupings[group]
      if (!groups) return
      if (!groups.includes(newType)) return

      setTemplate((oldTemplate) => {
        let buttonsComponent = oldTemplate.components.find(
          (component) => component?.type === 'BUTTONS',
        ) as ButtonComponent | undefined

        if (!buttonsComponent) return oldTemplate

        const buttonTypeCounts = buttonsComponent.buttons.reduce(
          (acc: Record<string, number>, button) => {
            acc[button.type] = (acc[button.type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        const maxAllowed = templateButtonsDictionary[newType].maximum as number
        if (buttonTypeCounts[newType] >= maxAllowed) {
          alert(`Maximum number of ${newType} buttons reached.`)
          return oldTemplate
        }

        let groupIndex = -1
        let buttonFound = false
        const updatedButtons = buttonsComponent.buttons.map((button) => {
          if (buttonsGroupings[group].includes(button.type)) {
            groupIndex++
            if (groupIndex === buttonIndex && !buttonFound) {
              buttonFound = true
              const updatedButton = templateButtonsDictionary[newType]
                .dataFormat as Button
              return updatedButton
            }
          }
          return button
        })

        if (!buttonFound) return oldTemplate

        const updatedComponents = oldTemplate.components.map((component) =>
          component?.type === 'BUTTONS'
            ? { ...component, buttons: updatedButtons }
            : component,
        )

        return {
          ...oldTemplate,
          components: updatedComponents,
        }
      })
    },
    [],
  )

  const handleButtonFieldChange = useCallback(
    (
      group: string,
      buttonIndex: number,
      field: string,
      newFieldValue: string,
    ) => {
      if (!buttonsGroupings[group]) return

      setTemplate((oldTemplate) => {
        const buttonsComponent = oldTemplate.components.find(
          (component) => component?.type === 'BUTTONS',
        ) as ButtonComponent
        if (!buttonsComponent || !buttonsComponent.buttons) return oldTemplate

        let groupIndex = -1
        let buttonFound = false
        const updatedButtons = buttonsComponent.buttons.map((button) => {
          if (buttonsGroupings[group].includes(button.type)) {
            groupIndex++
            if (groupIndex === buttonIndex && !buttonFound) {
              buttonFound = true
              groupIndex = -1
              const updatedButton = { ...button, [field]: newFieldValue }

              if (field === 'url') {
                // Remove all malformed placeholders of the form {{n}} and similar cases
                updatedButton.url = (updatedButton.url as string)
                  .replaceAll(/\{\{\d+\s*[^}]*\}\}/g, '') // Matches and removes valid and malformed {{n}}
                  .replaceAll(/\{\{\d+/g, '') // Matches and removes {{n without closing }}
                  .replaceAll(/\d+\}\}/g, '') // Matches and removes n}} without opening {{
                  .replaceAll(/\{\{\s*/g, '') // Matches and removes {{ with missing number and closing }}
                  .replaceAll(/\s*\}\}/g, '') // Matches and removes }} with extra spaces
                  .replaceAll(/\{\{[^}\s]*\s*\}\}/g, '') // Matches and removes malformed placeholders like {{n }} with extra spaces
                  .replaceAll(/[{}]/g, '') // Matches and removes single { or }
                  .trim()

                // Append {{1}} if urlType is 'DYNAMIC' and {{1}} is not already at the end
                if (
                  button.urlType === 'DYNAMIC' &&
                  !updatedButton.url.endsWith('{{1}}')
                ) {
                  updatedButton.url += '{{1}}'
                }
              }

              if (field === 'country' || field === 'number') {
                updatedButton.phoneNumber =
                  (updatedButton.country as string) +
                  (updatedButton.number as string)
              }
              if (field === 'urlType' && newFieldValue === 'STATIC') {
                updatedButton.mappings = {}
                updatedButton.substitutions = []
              }
              if (field === 'urlType' && newFieldValue === 'DYNAMIC') {
                updatedButton.mappings = { '1': '' }
                updatedButton.substitutions = []
              }
              return updatedButton
            }
          }
          return button
        })
        if (!buttonFound) return oldTemplate

        const updatedComponents = oldTemplate.components.map((component) =>
          component?.type === 'BUTTONS'
            ? { ...component, buttons: updatedButtons }
            : component,
        )
        return {
          ...oldTemplate,
          components: updatedComponents,
        }
      })
    },
    [],
  )

  const handleButtonMappingValueChange = useCallback(
    (group: string, buttonIndex: number, newValue: string) => {
      if (!buttonsGroupings[group]) return

      setTemplate((oldTemplate) => {
        const buttonsComponent = oldTemplate.components.find(
          (component) => component?.type === 'BUTTONS',
        ) as ButtonComponent
        if (!buttonsComponent || !buttonsComponent.buttons) return oldTemplate

        let groupIndex = -1
        let buttonFound = false
        const updatedButtons = buttonsComponent.buttons.map((button) => {
          if (buttonsGroupings[group].includes(button.type)) {
            groupIndex++
            if (groupIndex === buttonIndex && !buttonFound) {
              buttonFound = true
              groupIndex = -1 // Reset groupIndex for next group
              const updatedButton = {
                ...button,
                mappings: {
                  '1': newValue,
                },
              }
              return updatedButton
            }
          }
          return button
        })
        if (!buttonFound) return oldTemplate

        const updatedComponents = oldTemplate.components.map((component) =>
          component?.type === 'BUTTONS'
            ? { ...component, buttons: updatedButtons }
            : component,
        )
        return {
          ...oldTemplate,
          components: updatedComponents,
        }
      })
    },
    [],
  )

  const handleButtonSubstitutionValueChange = useCallback(
    (group: string, buttonIndex: number, newValue: string) => {
      if (!buttonsGroupings[group]) return

      setTemplate((oldTemplate) => {
        const buttonsComponent = oldTemplate.components.find(
          (component) => component?.type === 'BUTTONS',
        ) as ButtonComponent
        if (!buttonsComponent || !buttonsComponent.buttons) return oldTemplate

        let groupIndex = -1
        let buttonFound = false
        const updatedButtons = buttonsComponent.buttons.map((button) => {
          if (buttonsGroupings[group].includes(button.type)) {
            groupIndex++
            if (groupIndex === buttonIndex && !buttonFound) {
              buttonFound = true
              groupIndex = -1 // Reset groupIndex for next group
              const updatedButton = {
                ...button,
                substitutions: [newValue],
              }
              return updatedButton
            }
          }
          return button
        })
        if (!buttonFound) return oldTemplate

        const updatedComponents = oldTemplate.components.map((component) =>
          component?.type === 'BUTTONS'
            ? { ...component, buttons: updatedButtons }
            : component,
        )
        return {
          ...oldTemplate,
          components: updatedComponents,
        }
      })
    },
    [],
  )

  const getTemplateInfo = useCallback(async () => {
    const response = await getTemplate(templateId)
    if (response.status === 200) {
      setTemplate(response.data.template)
      setOldTemplate(response.data.template)
      if (response.data.variables.length > 0) {
        setTemplateVariables(response.data.variables)
      }
      setLoading(false)
    }
  }, [templateId])

  const getTemplateNames = useCallback(async () => {
    const existingTemplateResponse = await getExistingTemplateNames()
    if (
      existingTemplateResponse.status === 200 &&
      existingTemplateResponse.data !== null
    ) {
      setExistingTemplateNames(existingTemplateResponse.data)
    }
  }, [])

  useEffect(() => {
    if (
      selectedMode === 'create' ||
      selectedMode === 'view' ||
      selectedMode === 'edit'
    ) {
      getTemplateNames()
      if (pageMode === 'create' && templateId !== null) {
        navigateToPageMode('create')
      } else {
        setPageMode(selectedMode)
        if (templateId != null) {
          setLoading(true)
          getTemplateInfo()
        }
      }
    } else {
      setPageMode('view')
    }
  }, [
    selectedMode,
    pageMode,
    templateId,
    getTemplateNames,
    getTemplateInfo,
    navigateToPageMode,
  ])

  useEffect(() => {
    if (!loading && pageMode === 'edit') {
      const isChanged = checkForChanges()
      setChanged(isChanged)
    }
  }, [loading, pageMode, template])

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-6">
                <TemplateControl
                  pageMode={pageMode}
                  template={template}
                  errors={errors}
                  nameError={nameError}
                  changeName={changeName}
                  changeLanguage={changeLanguage}
                  changeCategory={changeCategory}
                  createTemplateInfo={createTemplateInfo}
                  updateTemplateInfo={updateTemplateInfo}
                  changed={changed}
                  navigateToPageMode={navigateToPageMode}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-8">
                  <TemplateHeader
                    pageMode={pageMode}
                    template={template}
                    templateVariables={templateVariables}
                    errors={errors}
                    handleFormatChange={handleFormatChange}
                    handleHeaderFormatTypeChange={handleHeaderFormatTypeChange}
                    handleSubFormatChange={handleHeaderSubFormatChange}
                    handleTextChange={handleTextChange}
                    handleAddVariable={handleAddVariable}
                    handleMappingValueChange={handleMappingValueChange}
                    handleSubstitutionValueChange={
                      handleSubstitutionValueChange
                    }
                    handleHeaderSubstitutionValueChangeOnFileRemove={
                      handleHeaderSubstitutionValueChangeOnFileRemove
                    }
                    file={file}
                    setFile={setFile}
                  />
                  <TemplateBody
                    pageMode={pageMode}
                    template={template}
                    templateVariables={templateVariables}
                    errors={errors}
                    handleTextChange={handleTextChange}
                    handleAddVariable={handleAddVariable}
                    handleMappingValueChange={handleMappingValueChange}
                    handleSubstitutionValueChange={
                      handleSubstitutionValueChange
                    }
                    handleTextFormattersClick={handleTextFormattersClick}
                  />
                  <TemplateFooter
                    pageMode={pageMode}
                    template={template}
                    errors={errors}
                    handleFormatChange={handleFormatChange}
                    handleTextChange={handleTextChange}
                  />
                  <TemplateButton
                    pageMode={pageMode}
                    template={template}
                    templateVariables={templateVariables}
                    errors={errors}
                    handleAddButton={handleAddButton}
                    handleRemoveButton={handleRemoveButton}
                    handleMoveButtonInDirection={handleMoveButtonInDirection}
                    handleSwapButtonGroup={handleSwapButtonGroup}
                    handleButtonTypeChange={handleButtonTypeChange}
                    handleButtonFieldChange={handleButtonFieldChange}
                    handleButtonMappingValueChange={
                      handleButtonMappingValueChange
                    }
                    handleButtonSubstitutionValueChange={
                      handleButtonSubstitutionValueChange
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <TemplatePreview template={template} />
            </div>
          </div>
        </div>
      )}
      <FileUploadProgress isOpen={showProgress} value={fileUploadProgress} />
    </div>
  )
}
