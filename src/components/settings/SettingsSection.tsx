interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
}

export default function SettingsSection({ title, subtitle, children, action }: Props) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="h-px bg-[#e8ebe8] mb-8" />
      {children}
    </div>
  )
}
