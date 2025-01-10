import { phone } from 'phone'

type Variable = {
  matchString: string
  matchVariable: string
  startIndex: number
  endIndex: number
  replacementString: string
  replacementVariable: string
}

export type TextFormatter = 'bold' | 'italics' | 'strikethrough' | 'monospace'

export type Substitution = string | object | File | null

export type ComponentBase = {
  type: string
  format?: string
  text?: string
  mappings?: Record<string, string> | null
  substitutions?: Substitution[]
  variables?: Variable[]
}

export type HeaderComponent = ComponentBase & {
  type: 'HEADER'
  subFormat?: string
  formatType?: string
  file?: {
    key: string
    fileURL: string
    fileName: string
    originalName: string
    mimeType: string
    size: number
  }
}

export type BodyComponent = ComponentBase & {
  type: 'BODY'
}

export type FooterComponent = ComponentBase & {
  type: 'FOOTER'
}

type ButtonType = 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE'

type ButtonDataFormat = {
  type: ButtonType
  text: string
  mappings: Record<string, string>
  substitutions: string[]
  textEditable: boolean
  urlType?: string
  url?: string
  country?: string
  phoneNumber?: string
  number?: string
  codeType?: string
}

export type Button = {
  type: ButtonType
  text: string
  url?: string
  phoneNumber?: string
  urlType?: 'STATIC' | 'DYNAMIC'
  country?: string
  number?: string
  mappings?: Record<string, string>
  substitutions?: string[]
  name?: string
  value?: ButtonType
  maximum?: number
  dataFormat?: ButtonDataFormat
}

export type ButtonComponent = ComponentBase & {
  type: 'BUTTONS'
  buttons: Button[]
}

export type Component =
  | HeaderComponent
  | BodyComponent
  | FooterComponent
  | ButtonComponent

export type WhatsappTemplate = {
  templateId: string
  accountId: string
  organizationId: string
  name: string
  language: string
  category: string
  status: string
  components: Component[]
  createdAt: string
  updatedAt: string
}

// Define types for various structures used in the file
type TemplateCategory = {
  name: string
  value: string
  disabled: boolean
}

type TemplateFormat = {
  name: string
  value: string
  subFormats: string[]
}

type UrlType = {
  name: string
  value: string
}

type MediaType = {
  name: string
  extension: string
  mimeType: string
  maxSize: string
  notes?: string
}

export const templateCategories: TemplateCategory[] = [
  { name: 'MARKETING', value: 'MARKETING', disabled: false },
  { name: 'UTILITY', value: 'UTILITY', disabled: false },
  { name: 'AUTHENTICATION', value: 'AUTHENTICATION', disabled: true },
]

export const templateHeaderMediaSubFormats: string[] = [
  'IMAGE',
  'VIDEO',
  'DOCUMENT',
  'LOCATION',
]

export const templateHeaderFormats: TemplateFormat[] = [
  { name: 'None', value: 'NONE', subFormats: [] },
  { name: 'Text', value: 'TEXT', subFormats: [] },
  { name: 'Media', value: 'MEDIA', subFormats: templateHeaderMediaSubFormats },
]

export const templateFooterFormats: TemplateFormat[] = [
  { name: 'None', value: 'NONE', subFormats: [] },
  { name: 'Text', value: 'TEXT', subFormats: [] },
]

export const maxTemplateButtons: number = 10

export const urlTypes: UrlType[] = [
  { name: 'Static', value: 'STATIC' },
  { name: 'Dynamic', value: 'DYNAMIC' },
]

export const copyCodeTypes: UrlType[] = [
  { name: 'Static', value: 'STATIC' },
  { name: 'Dynamic', value: 'DYNAMIC' },
]

export const buttonsGroupings: Record<string, string[]> = {
  QUICK_REPLY: ['QUICK_REPLY'],
  CALL_TO_ACTION: ['URL', 'PHONE_NUMBER', 'COPY_CODE'],
}

export const quickReplyButtons: Button[] = [
  {
    type: 'QUICK_REPLY',
    text: '',
    name: 'Custom',
    value: 'QUICK_REPLY',
    maximum: maxTemplateButtons,
    dataFormat: {
      type: 'QUICK_REPLY',
      text: '',
      mappings: {},
      substitutions: [],
      textEditable: true,
    },
  },
]

export const callToActionButtons: Button[] = [
  {
    type: 'URL',
    text: '',
    name: 'Visit Website',
    value: 'URL',
    maximum: 2,
    dataFormat: {
      type: 'URL',
      text: '',
      urlType: 'STATIC',
      url: '',
      mappings: {},
      substitutions: [],
      textEditable: true,
    },
  },
  {
    type: 'PHONE_NUMBER',
    text: '',
    name: 'Call Phone Number',
    value: 'PHONE_NUMBER',
    maximum: 1,
    dataFormat: {
      type: 'PHONE_NUMBER',
      text: '',
      country: '',
      phoneNumber: '',
      number: '',
      mappings: {},
      substitutions: [],
      textEditable: true,
    },
  },
  {
    type: 'COPY_CODE',
    text: 'Copy offer code',
    name: 'Copy Offer Code',
    value: 'COPY_CODE',
    maximum: 1,
    dataFormat: {
      type: 'COPY_CODE',
      text: 'Copy offer code',
      codeType: 'DYNAMIC',
      mappings: { '1': '' },
      substitutions: [],
      textEditable: false,
    },
  },
]

export const templateButtonsDictionary: Record<string, Button> = [
  ...quickReplyButtons,
  ...callToActionButtons,
].reduce(
  (dictionary, button) => {
    if (button.value) {
      dictionary[button.value] = button
    }
    return dictionary
  },
  {} as Record<string, Button>,
)

// export type Template = {
//   components: any[]
//   name: string
//   language: string
//   category: string
//   [key: string]: any
// }

export const removeVariables = (template: WhatsappTemplate): WhatsappTemplate => {
  const { components, name, language, category, ...rest } = template
  const templateWithoutVariables = {
    components: components.map((component) => {
      const { variables, ...rest } = component
      return rest
    }),
    name,
    language,
    category,
    ...rest,
  }
  return templateWithoutVariables
}

export type ValidationResult = {
  type: string
  isValid: boolean
  extras: Record<string, boolean>
}

export type TemplateValidationResult = {
  isValid: boolean
  components: ValidationResult[]
}

type ButtonValidationResult = {
  textValid: boolean
  mappingsValid: boolean
  substitutionsValid: boolean
}

export const validateTemplate = (
  templateDetails: WhatsappTemplate,
): TemplateValidationResult => {
  try {
    const validations: ValidationResult[] = []

    const addValidation = (
      type: string,
      isValid: boolean,
      extras: Record<string, boolean> = {},
    ) => {
      validations.push({ type, isValid, extras })
    }

    const isNameValid = !!(templateDetails.name && templateDetails.name.trim())
    addValidation('name', isNameValid, {})

    const isLanguageValid = !!(
      templateDetails.language && templateDetails.language.trim()
    )
    addValidation('language', isLanguageValid, {})

    const isCategoryValid = !!(
      templateDetails.category && templateDetails.category.trim()
    )
    addValidation('category', isCategoryValid, {})

    const results = templateDetails.components.map((component: any) => {
      let mappingsValid = false
      let substitutionsValid = false
      let textValid = false

      if (component.type === 'HEADER') {
        if (component.format === 'NONE') {
          textValid = true
          mappingsValid = true
          substitutionsValid = true
        } else if (component.format === 'TEXT') {
          textValid = component.text.trim() !== ''
          mappingsValid = component.mappings
            ? Object.values(component.mappings).every(
                (value) => typeof value === 'string' && value.trim() !== '',
              )
            : true
          substitutionsValid = component.substitutions
            ? component.substitutions.every(
                (substitution: string) => substitution.trim() !== '',
              )
            : true
        } else if (component.format === 'MEDIA') {
          const { subFormat, formatType } = component
          const validSubFormats = ['IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION']
          const validFormatType = ['STATIC', 'DYNAMIC'].includes(formatType)
          const validSubFormat = validSubFormats.includes(subFormat)
          if (validFormatType && validSubFormat) {
            textValid = true
            if (formatType === 'DYNAMIC') {
              mappingsValid = component.mappings
                ? Object.values(component.mappings).every(
                    (value) => typeof value === 'string' && value.trim() !== '',
                  )
                : false
              if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(subFormat)) {
                substitutionsValid =
                  component.substitutions && component.substitutions.length > 0
                    ? typeof component.substitutions[0] === 'object'
                    : false
              } else if (subFormat === 'LOCATION') {
                substitutionsValid = component.substitutions
                  ? component.substitutions.every(
                      (substitution: string) =>
                        typeof substitution === 'string' &&
                        substitution.trim() !== '',
                    )
                  : true
              } else {
                substitutionsValid = false
              }
            } else if (formatType === 'STATIC') {
              mappingsValid = true
              if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(subFormat)) {
                substitutionsValid =
                  component.substitutions && component.substitutions.length > 0
                    ? typeof component.substitutions[0] === 'object'
                    : false
              } else if (subFormat === 'LOCATION') {
                substitutionsValid = component.substitutions
                  ? component.substitutions.every(
                      (substitution: string) =>
                        typeof substitution === 'string' &&
                        substitution.trim() !== '',
                    )
                  : true
              } else {
                substitutionsValid = false
              }
            }
          } else {
            textValid = false
            mappingsValid = false
            substitutionsValid = false
          }
        }
      } else if (component.type === 'BODY') {
        const substitutionsLength = component.substitutions
          ? component.substitutions.length
          : 0
        const mappingsLength = component.mappings
          ? Object.values(component.mappings).length
          : 0
        if (mappingsLength === 0 && substitutionsLength === 0) {
          mappingsValid = mappingsLength === 0
          substitutionsValid = substitutionsLength === 0
        } else {
          substitutionsValid = component.substitutions
            ? component.substitutions.every(
                (substitution: string) =>
                  typeof substitution === 'string' &&
                  substitution.trim() !== '',
              )
            : true
          mappingsValid = component.mappings
            ? Object.values(component.mappings).every(
                (value) => typeof value === 'string' && value.trim() !== '',
              )
            : true
        }
        textValid =
          component.text.trim() !== '' && component.text.trim().length <= 1024
      } else if (component.type === 'FOOTER') {
        mappingsValid = true
        substitutionsValid = true
        textValid = !(component.variables && component.variables.length > 0)
      } else if (component.type === 'BUTTONS') {
        if (component.buttons && component.buttons.length > 0) {
          const buttonResults = component.buttons.map((button: Button) => {
            const buttonMappingsValid = button.mappings
              ? Object.values(button.mappings).every(
                  (value) => typeof value === 'string' && value.trim() !== '',
                )
              : true
            const buttonSubstitutionsValid = component.substitutions
              ? component.substitutions.every(
                  (substitution: string) =>
                    typeof substitution === 'string' &&
                    substitution.trim() !== '',
                )
              : true

            const isValidText = button.text.trim() !== ''
            const isValidUrl = button.url ? button.url.trim() !== '' : true
            const isValidURLType = button.urlType
              ? ['STATIC', 'DYNAMIC'].includes(button.urlType)
              : true
            const isValidCountry = button.country
              ? button.country.trim() !== ''
              : true
            const isValidPhoneNumber = button.phoneNumber
              ? button.phoneNumber.trim() !== ''
              : true
            return {
              textValid:
                isValidText &&
                isValidUrl &&
                isValidURLType &&
                isValidCountry &&
                isValidPhoneNumber,
              mappingsValid: buttonMappingsValid,
              substitutionsValid: buttonSubstitutionsValid,
            }
          })
          textValid = buttonResults.every(
            (result: ButtonValidationResult) => result.textValid,
          )
          mappingsValid = buttonResults.every(
            (result: ButtonValidationResult) => result.mappingsValid,
          )
          substitutionsValid = buttonResults.every(
            (result: ButtonValidationResult) => result.substitutionsValid,
          )
        } else {
          textValid = true
          mappingsValid = true
          substitutionsValid = true
        }
      }

      return {
        type: component.type,
        isValid: mappingsValid && substitutionsValid && textValid,
        extras: {
          isMappingsValid: mappingsValid,
          isSubstitutionsValid: substitutionsValid,
          isTextValid: textValid,
        },
      }
    })

    validations.push(...results)
    const isTemplateValid = validations.every((result) => result.isValid)
    return { isValid: isTemplateValid, components: validations }
  } catch (e) {
    return { isValid: false, components: [] }
  }
}

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  return phoneNumber?.length > 5 ? phone(phoneNumber).isValid : true
}

type ParsedPhoneNumber = {
  countryCode: string
  number: string
}

export const parsePhoneNumber = (phoneNumber: string): ParsedPhoneNumber => {
  const parsed = phone(phoneNumber)
  return {
    countryCode: parsed.countryCode ?? '',
    number:
      (parsed.phoneNumber ?? '').replace(parsed.countryCode ?? '', '') ?? '',
  }
}

type Difference = {
  oldValue: any
  newValue: any
}

interface DiffObject {
  [key: string]: Difference | DiffObject
}

export const findDifferences = (obj1: any, obj2: any): DiffObject => {
  const diff: DiffObject = {}
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      if (obj1[key] instanceof Object && obj2[key] instanceof Object) {
        const nestedDiff = findDifferences(obj1[key], obj2[key])
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff
        }
      } else if (obj1[key] !== obj2[key]) {
        diff[key] = { oldValue: obj1[key], newValue: obj2[key] }
      }
    }
  }
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
      diff[key] = { oldValue: undefined, newValue: obj2[key] }
    }
  }
  return diff
}

export const findVariablesAndReplacements = (text: string): Variable[] => {
  const regex = /\{\{([1-9]\d*)\}\}/g
  let match
  const variables: Variable[] = []
  let index = 0
  while ((match = regex.exec(text)) !== null) {
    index++
    variables.push({
      matchString: match[0],
      matchVariable: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      replacementString: `{{${index}}}`,
      replacementVariable: `${index}`,
    })
  }
  return variables
}

type SerializedTextResult = {
  text: string
  mappings: Record<string, string>
  substitutions: Substitution[]
  variables: Variable[]
}

export const serializeTextMappingsAndSubstitutions = (
  componentType: string,
  inputText: string,
  existingMapping: Record<string, string> = {},
  existingSubstitutions: Substitution[] = [],
): SerializedTextResult | undefined => {
  try {
    const variables = findVariablesAndReplacements(inputText)
    const serializedVariables: string[] = []
    let outputText = inputText

    if (componentType === 'HEADER' && variables.length > 1) {
      variables.forEach((variable, index) => {
        if (index > 0) {
          outputText =
            outputText.substring(0, variable.startIndex) +
            outputText.substring(variable.endIndex)
        }
      })
      variables.splice(1)
    }

    variables.forEach((variable, index) => {
      outputText =
        outputText.substring(0, variable.startIndex) +
        variable.replacementString +
        outputText.substring(variable.endIndex)
      serializedVariables.push(`${index + 1}`)
    })

    const finalMapping: Record<string, string> = {}
    serializedVariables.forEach((variable, index) => {
      if (existingMapping?.hasOwnProperty(variable))
        finalMapping[index + 1] = existingMapping[variable]
      else finalMapping[index + 1] = ''
    })

    const finalSubstitutions = serializedVariables.map(
      (variable, index) => existingSubstitutions[index] || '',
    )
    return {
      text: outputText,
      mappings: finalMapping,
      substitutions: finalSubstitutions,
      variables: variables,
    }
  } catch (error) {
    console.log(error)
    return undefined
  }
}

export const mediaTypes: Record<string, MediaType[]> = {
  AUDIO: [
    {
      name: 'MP3',
      extension: '.mp3',
      mimeType: 'audio/mpeg',
      maxSize: '16 MB',
    },
    {
      name: 'MP4 Audio',
      extension: '.m4a',
      mimeType: 'audio/mp4',
      maxSize: '16 MB',
    },
    {
      name: 'AAC',
      extension: '.aac',
      mimeType: 'audio/aac',
      maxSize: '16 MB',
    },
    {
      name: 'AMR',
      extension: '.amr',
      mimeType: 'audio/amr',
      maxSize: '16 MB',
    },
    {
      name: 'OGG Audio',
      extension: '.ogg',
      mimeType: 'audio/ogg',
      notes: 'OPUS codecs only; base audio/ogg not supported.',
      maxSize: '16 MB',
    },
  ],
  DOCUMENT: [
    {
      name: 'Text',
      extension: '.txt',
      mimeType: 'text/plain',
      maxSize: '100 MB',
    },
    {
      name: 'PDF',
      extension: '.pdf',
      mimeType: 'application/pdf',
      maxSize: '100 MB',
    },
    {
      name: 'DOC',
      extension: '.doc',
      mimeType: 'application/msword',
      maxSize: '100 MB',
    },
    {
      name: 'PPT',
      extension: '.ppt',
      mimeType: 'application/vnd.ms-powerpoint',
      maxSize: '100 MB',
    },
    {
      name: 'XLS',
      extension: '.xls',
      mimeType: 'application/vnd.ms-excel',
      maxSize: '100 MB',
    },
    {
      name: 'XLSX',
      extension: '.xlsx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      maxSize: '100 MB',
    },
    {
      name: 'DOCX',
      extension: '.docx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      maxSize: '100 MB',
    },
    {
      name: 'PPTX',
      extension: '.pptx',
      mimeType:
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      maxSize: '100 MB',
    },
  ],
  IMAGE: [
    {
      name: 'JPEG',
      extension: '.jpeg',
      mimeType: 'image/jpeg',
      maxSize: '5 MB',
    },
    {
      name: 'PNG',
      extension: '.png',
      mimeType: 'image/png',
      maxSize: '5 MB',
    },
  ],
  STICKER: [
    {
      name: 'Animated sticker',
      extension: '.webp',
      mimeType: 'image/webp',
      maxSize: '500 KB',
    },
    {
      name: 'Static sticker',
      extension: '.webp',
      mimeType: 'image/webp',
      maxSize: '100 KB',
    },
  ],
  VIDEO: [
    {
      name: 'MP4 Video',
      extension: '.mp4',
      mimeType: 'video/mp4',
      maxSize: '16 MB',
    },
    {
      name: '3GPP Video',
      extension: '.3gp',
      mimeType: 'video/3gp',
      maxSize: '16 MB',
    },
  ],
}

export const getFileTypeInstructions = (subFormat: string): string => {
  try {
    if (mediaTypes[subFormat]) {
      const fileTypes = mediaTypes[subFormat].map((type) => type.name)
      return fileTypes.slice(0, 3).join(' or ')
    }
    return ''
  } catch (e) {
    console.log('Error in templateUtils.getFileTypeInstructions', e)
    return ''
  }
}

export const getAcceptableFormats = (subFormat: string): string => {
  try {
    if (mediaTypes[subFormat]) {
      return mediaTypes[subFormat].map((type) => type.mimeType).join(',')
    }
    return '*'
  } catch (e) {
    console.log('Error in templateUtils.getAcceptableFormats', e)
    return '*'
  }
}

export const isFileTypeAccepted = (
  format: string,
  fileType: string,
): boolean => {
  try {
    if (mediaTypes[format]) {
      return mediaTypes[format].some((type) => type.mimeType === fileType)
    }
    return false
  } catch (e) {
    console.log('Error in templateUtils.isFileTypeAccepted', e)
    return false
  }
}

export const isFileSizeAccepted = (
  format: string,
  fileSize: number,
): boolean => {
  try {
    if (mediaTypes[format]) {
      return mediaTypes[format].some((type) => {
        const maxSizeMB = parseFloat(type.maxSize)
        const maxSizeBytes = maxSizeMB * 1024 * 1024
        return fileSize <= maxSizeBytes
      })
    }
    return false
  } catch (e) {
    console.log('Error in templateUtils.isFileSizeAccepted', e)
    return false
  }
}

export const getMaxSize = (format: string, file: File): string => {
  try {
    return (
      mediaTypes[format].find((type) => file.type === type.mimeType)?.maxSize ||
      '100MB'
    )
  } catch (e) {
    console.log('Error in templateUtils.getMaxSize', e)
    return '100MB'
  }
}
