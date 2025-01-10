import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface WidgetConfig {
  logo: string
  heading: string
}

export default function ConversationHeader({
  widgetConfig,
}: {
  widgetConfig: WidgetConfig
}) {
  return (
    <div className="p-2 top-0 bg-[#085E56] rounded-t-[15px] sticky flex flex-row justify-start items-center z-[2147483647]">
      <div className="flex flex-row justify-start items-center">
        <Avatar className="mr-2 bg-white w-[45px] h-[45px]">
          <AvatarImage
            src={
              widgetConfig.logo !== 'default'
                ? widgetConfig.logo
                : '/whatsapp-logo.png'
            }
            alt="Logo"
          />
          <AvatarFallback>Logo</AvatarFallback>
        </Avatar>
        <span className="text-[16px] font-bold text-white">
          {widgetConfig.heading}
        </span>
      </div>
    </div>
  )
}
