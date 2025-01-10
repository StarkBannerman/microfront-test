import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

function AgentsHeader({
  setViewAgents,
}: {
  setViewAgents: (value: boolean) => void
}) {
  return (
    <div className="p-2 top-0 bg-[#085E56] rounded-t-[15px] sticky flex flex-row justify-start items-center">
      <div className="flex flex-col items-start">
        <h2 className="font-bold text-[24px] text-white">Hello !</h2>
        <p className="text-[14px] text-white">
          Any Questions? feel free to chat with our agents
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto text-white"
        onClick={() => setViewAgents(false)}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
    </div>
  )
}

export default AgentsHeader
