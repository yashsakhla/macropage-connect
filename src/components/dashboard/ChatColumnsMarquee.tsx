import { cn } from '@/lib/utils'

// Decorative chat bubbles for the drifting column in the dashboard hero
// banner — not real conversation data, just enough variety that the loop
// doesn't look repetitive.
const MESSAGES = [
  { text: 'Hey! Is my order shipped yet?', out: false },
  { text: 'Yes, it left the warehouse today 🚚', out: true },
  { text: 'Your appointment is confirmed for 5 PM', out: true },
  { text: 'Great, see you then!', out: false },
  { text: 'Campaign sent to 2,400 contacts ✅', out: true },
  { text: 'Can I get a discount on bulk orders?', out: false },
  { text: 'Sure, here is a 10% off coupon', out: true },
  { text: 'Thanks, that was quick!', out: false },
]

function Bubble({ text, out }: { text: string; out: boolean }) {
  return (
    <div className={cn('flex', out ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[180px] rounded-2xl px-3 py-2 text-[11px] leading-snug shadow-sm',
          out ? 'bg-[#1a5c3a] text-white rounded-br-sm' : 'bg-white text-gray-700 rounded-bl-sm'
        )}
      >
        {text}
      </div>
    </div>
  )
}

export default function ChatColumnsMarquee() {
  return (
    <div className="relative h-full w-36 sm:w-44 overflow-hidden py-4 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
      <div className="absolute inset-x-0 top-0 flex flex-col gap-2.5 animate-scroll-up">
        {/* Rendered twice back-to-back so translating by -50% loops seamlessly */}
        {[...MESSAGES, ...MESSAGES].map((m, i) => (
          <Bubble key={i} text={m.text} out={m.out} />
        ))}
      </div>
    </div>
  )
}
