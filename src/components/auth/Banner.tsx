import Image from 'next/image'

export const mercuriTextLogo =
  'https://static.wixstatic.com/media/94f2c6_c2695dbaf54c46da92c407ca0b198728~mv2.png'

interface BannerProps {
  testimonial: string
  author: string
  authorTitle: string
}

export function Banner({ testimonial, author, authorTitle }: BannerProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-between p-12">
      <div>
        <Image
          src={mercuriTextLogo}
          alt="Mercuri Logo"
          width={200}
          height={50}
        />
      </div>
      <div>
        <p className="text-2xl font-semibold mb-2">{testimonial}</p>
        <p className="text-xl">{author}</p>
        <p className="text-sm text-gray-400">{authorTitle}</p>
      </div>
      <div className="text-sm">
        Empower your business with Mercuri's SMS and WhatsApp platform
      </div>
    </div>
  )
}
