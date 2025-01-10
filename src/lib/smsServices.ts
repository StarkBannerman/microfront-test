import axiosInstance from './axios'

export async function getSMSInfo(instanceId: string) {
  try {
    const response = await axiosInstance.post(
      `/api/channels/sms/twilio/smsInfo`,
    )
    return { status: response.status, data: response.data }
  } catch (error: any) {
    return { status: error.response?.status, data: error.response?.data }
  }
}

export async function createTemplate(template: any) {
  try {
    const response = await axiosInstance.post(
      `/api/channels/sms/twilio/createTemplate`,
      {
        template,
      },
    )
    return { status: response.status, data: response.data }
  } catch (error: any) {
    return { status: error.response?.status, data: error.response?.data }
  }
}

export async function updateTemplate(templateId: string, template: any) {
  try {
    const response = await axiosInstance.post(
      `/api/channels/sms/twilio/updateTemplate`,
      {
        templateId,
        template,
      },
    )
    return { status: response.status, data: response.data }
  } catch (error: any) {
    return { status: error.response?.status, data: error.response?.data }
  }
}

export async function getTemplate(templateId: string) {
  try {
    const response = await axiosInstance.post(
      `/api/channels/sms/twilio/getTemplate`,
      {
        templateId,
      },
    )
    return { status: response.status, data: response.data }
  } catch (error: any) {
    return { status: error.response?.status, data: error.response?.data }
  }
}

export async function deleteTemplate(instanceId: string, templateId: string) {
  try {
    const response = await axiosInstance.post(
      `/api/channels/sms/twilio/deleteTemplate`,
      {
        templateId,
      },
    )
    return { status: response.status, data: response.data }
  } catch (error: any) {
    return { status: error.response?.status, data: error.response?.data }
  }
}

export async function changeSMSTemplateStatus(
  instanceId: string,
  templateId: string,
  sendTemplate: boolean,
) {
  try {
    const response = await axiosInstance.post(
      `/api/channels/sms/twilio/changeSMSTemplateStatus`,
      {
        templateId,
        sendTemplate,
      },
    )
    return { status: response.status, data: response.data }
  } catch (error: any) {
    return { status: error.response?.status, data: error.response?.data }
  }
}
