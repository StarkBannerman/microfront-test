import axiosInstance from './axios'
import { AxiosResponse, AxiosError, AxiosProgressEvent } from 'axios'
import { WhatsappTemplate } from './templateUtils'


type ApiResponse = {
  status: number
  data: any
}

export async function createTemplate(
  accountId: string,
  template: WhatsappTemplate,
  file: File | null,
  onProgress: (percent: number) => void,
): Promise<ApiResponse> {
  try {
    const formData = new FormData()
    formData.append('accountId', accountId)
    formData.append('template', JSON.stringify(template))
    if (file) {
      formData.append('file', file)
    }

    const response: AxiosResponse = await axiosInstance.post(
      `/api/channels/whatsapp/createTemplate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
          )
          onProgress(percent)
        },
      },
    )

    return { status: response.status, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      status: axiosError.response?.status || 500,
      data: axiosError.response?.data || 'An error occurred',
    }
  }
}

export async function updateTemplate(
  template: WhatsappTemplate,
  file: File | null,
  onProgress: (percent: number) => void,
): Promise<ApiResponse> {
  try {
    const formData = new FormData()
    formData.append('template', JSON.stringify(template))
    if (file) {
      formData.append('file', file)
    }

    const response: AxiosResponse = await axiosInstance.post(
      `/api/channels/whatsapp/updateTemplate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 1),
          )
          onProgress(percent)
        },
      },
    )

    return { status: response.status, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      status: axiosError.response?.status || 500,
      data: axiosError.response?.data || 'An error occurred',
    }
  }
}

export async function getTemplate(
  templateId: string | null,
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axiosInstance.post(
      `/api/channels/whatsapp/getTemplate`,
      {
        templateId: templateId,
      },
    )

    return { status: response.status, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      status: axiosError.response?.status || 500,
      data: axiosError.response?.data || 'An error occurred',
    }
  }
}

export async function getExistingTemplateNames(): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axiosInstance.post(
      `/api/channels/whatsapp/getAllTemplateNames`,
    )

    return { status: response.status, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      status: axiosError.response?.status || 500,
      data: axiosError.response?.data || 'An error occurred',
    }
  }
}

export async function deleteTemplate(template: WhatsappTemplate): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axiosInstance.post(
      `/api/channels/whatsapp/deleteTemplate`,
      {
        template: template,
      },
    )

    return { status: response.status, data: response.data }
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      status: axiosError.response?.status || 500,
      data: axiosError.response?.data || 'An error occurred',
    }
  }
}
