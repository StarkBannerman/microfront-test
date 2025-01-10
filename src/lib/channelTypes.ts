export interface SmsNumber {
  phoneNumberId: string
  accountId: string
  organizationId: string
  messagingServiceId: string
  phoneNumber: string
  numberType: string
  capabilities: {
    fax: boolean
    voice: boolean
    sms: boolean
    mms: boolean
  }
  optInEnabled: boolean
  optOutEnabled: boolean
  optInKeywords: string[]
  optInReplyText: string
  optOutKeywords: string[]
  optOutReplyText: string
  initialFee: number
  monthlyFee: number
  createdAt: string
  updatedAt: string
}

export interface SmsAccount {
  accountId: string
  organizationId: string
  ownerAccountId: string
  authToken: string
  accountName: string
  serviceProvider: string
  status: string
  createdAt: string
  updatedAt: string
  smsNumbers: SmsNumber[]
}

export interface WhatsappNumber {
  phoneNumberId: string
  accountId: string
  organizationId: string
  pin: string
  verifiedName: string
  phoneNumber: string
  registrationStatus: string
  connectionStatus: string
  qualityRating: string
  optInEnabled: boolean
  optOutEnabled: boolean
  optInKeywords: string[]
  optInReplyText: string
  optOutKeywords: string[]
  optOutReplyText: string
  createdAt: string
  updatedAt: string
}

export interface WhatsappBusinessAccount {
  accountId: string
  organizationId: string
  accountName: string
  currency: string
  timezoneId: string
  createdAt: string
  updatedAt: string
  whatsappNumbers: WhatsappNumber[]
}

export interface App {
  instanceId: string
  organizationId: string
  platform: string
  website: string
  businessName: string
  isAppInstalled: boolean
}

export interface ChannelConfiguration {
  channelId: string
  instanceId: string
  organizationId: string
  channel: 'sms' | 'whatsapp'
  phoneNumberId: string
}

export interface NumbersTableProps {
  numbers: (SmsNumber | WhatsappNumber)[]
  type: 'sms' | 'whatsapp'
  configurations: ChannelConfiguration[]
  toggleDefault: (channelId: string) => void
  apps: App[]
}

export interface AccountCardProps {
  account: SmsAccount | WhatsappBusinessAccount
  numbers: (SmsNumber | WhatsappNumber)[]
  type: 'sms' | 'whatsapp'
  onUpdate: (updatedNumber: SmsNumber | WhatsappNumber) => void
}

export interface NumberCardProps {
  number: SmsNumber | WhatsappNumber
  type: 'sms' | 'whatsapp'
  onUpdate: (updatedNumber: SmsNumber | WhatsappNumber) => void
}
