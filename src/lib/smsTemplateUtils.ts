type Difference = {
  oldValue?: any
  newValue?: any
  [key: string]: any
}

export const findDifferences = (obj1: any, obj2: any): Difference => {
  const diff: Difference = {}
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
  return diff
}

type Variable = {
  matchString: string
  startIndex: number
  endIndex: number
  replacemet: string
  replacementVariable: string
}

export const findVariables = (text: string): Variable[] => {
  try {
    const regex = /\{#var#\}/g
    let match: RegExpExecArray | null
    const variables: Variable[] = []
    let index = 0

    while ((match = regex.exec(text)) !== null) {
      index++
      variables.push({
        matchString: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        replacemet: `{${index}}`,
        replacementVariable: `${index}`,
      })
    }
    return variables
  } catch (error) {
    console.log(error)
    return []
  }
}

export const serializeTextMappings = (
  inputText: string,
  existingMapping: { [key: string]: string } = {},
): { [key: string]: string } => {
  try {
    const variables = findVariables(inputText)
    const mappings: { [key: string]: string } = {}
    variables.forEach((variable, index) => {
      const replacementKey = `${index + 1}`
      if (existingMapping.hasOwnProperty(variable.replacementVariable)) {
        mappings[replacementKey] = existingMapping[variable.replacementVariable]
      } else {
        mappings[replacementKey] = ''
      }
    })
    return mappings
  } catch (error) {
    console.log(error)
    return {}
  }
}

interface Template {
  mappings?: { [key: string]: string }
  senderId?: string
  [key: string]: any
}

export const isTemplateValid = (template: Template): boolean => {
  try {
    const { mappings, senderId, ...otherFields } = template
    const allFieldsFilled:boolean = Object.values(otherFields).every((value) => {
      if (typeof value === 'string') {
        return value.trim() !== ''
      } else if (typeof value === 'boolean') {
        return value !== null && value !== undefined
      } else if (Array.isArray(value)) {
        return value.length > 0
      } else if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0
      } else {
        return value !== null && value !== undefined
      }
    })

    const allMappingsValid:boolean =(
      mappings &&
      typeof mappings === 'object' &&
      Object.values(mappings).every(
        (value) => typeof value === 'string' && value.trim() !== '',
      )) as boolean

    return allFieldsFilled && allMappingsValid
  } catch (e) {
    return false
  }
}
