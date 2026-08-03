interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
}

export default function SettingsSection({ title, subtitle, children, action }: Props) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="h-px bg-[#e8ebe8] dark:bg-white/10 mb-6 sm:mb-8" />
      {children}
    </div>
  )
}
