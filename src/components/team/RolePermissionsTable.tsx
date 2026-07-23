import { CheckCircle, X } from 'lucide-react'

const GROUPS = [
  {
    name: 'Conversations',
    rows: [
      { feature: 'View all conversations',  admin: true,  manager: true,  agent: false },
      { feature: 'Reply to messages',        admin: true,  manager: true,  agent: true  },
      { feature: 'Assign conversations',     admin: true,  manager: true,  agent: false },
      { feature: 'Resolve conversations',    admin: true,  manager: true,  agent: true  },
    ],
  },
  {
    name: 'Contacts',
    rows: [
      { feature: 'View contacts',     admin: true, manager: true,  agent: true  },
      { feature: 'Add/edit contacts', admin: true, manager: true,  agent: true  },
      { feature: 'Import contacts',   admin: true, manager: true,  agent: false },
      { feature: 'Export contacts',   admin: true, manager: true,  agent: false },
      { feature: 'Delete contacts',   admin: true, manager: false, agent: false },
    ],
  },
  {
    name: 'Campaigns',
    rows: [
      { feature: 'View campaigns',    admin: true, manager: true,  agent: false },
      { feature: 'Create campaigns',  admin: true, manager: true,  agent: false },
      { feature: 'Launch campaigns',  admin: true, manager: false, agent: false },
      { feature: 'Delete campaigns',  admin: true, manager: false, agent: false },
    ],
  },
  {
    name: 'Templates',
    rows: [
      { feature: 'View templates',    admin: true, manager: true,  agent: true  },
      { feature: 'Create templates',  admin: true, manager: true,  agent: false },
      { feature: 'Delete templates',  admin: true, manager: false, agent: false },
    ],
  },
  {
    name: 'Analytics',
    rows: [
      { feature: 'View analytics',   admin: true, manager: true,  agent: false },
      { feature: 'Export reports',   admin: true, manager: false, agent: false },
    ],
  },
  {
    name: 'Team',
    rows: [
      { feature: 'View team members',   admin: true, manager: true,  agent: false },
      { feature: 'Invite team members', admin: true, manager: false, agent: false },
      { feature: 'Change roles',        admin: true, manager: false, agent: false },
      { feature: 'Remove members',      admin: true, manager: false, agent: false },
    ],
  },
  {
    name: 'Settings',
    rows: [
      { feature: 'Account settings',    admin: true,  manager: false, agent: false },
      { feature: 'WhatsApp settings',   admin: true,  manager: false, agent: false },
      { feature: 'Billing',             admin: true,  manager: false, agent: false },
      { feature: 'API keys',            admin: true,  manager: false, agent: false },
    ],
  },
]

export default function RolePermissionsTable() {
  return (
    <div className="bg-white dark:bg-[#0b1220] border border-[#e8ebe8] dark:border-white/10 rounded-2xl overflow-hidden">
      <div className="grid grid-cols-4 bg-[#f7f8f6] dark:bg-[#0f1724] border-b border-[#e8ebe8] dark:border-white/10 px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <span>Feature</span>
        <span className="text-center text-purple-600 dark:text-purple-400">Admin</span>
        <span className="text-center text-blue-600 dark:text-blue-400">Manager</span>
        <span className="text-center text-[#1a5c3a]">Agent</span>
      </div>

      {GROUPS.map(group => (
        <div key={group.name}>
          <div className="bg-[#f7f8f6] dark:bg-[#0f1724] px-5 py-2 border-t border-[#e8ebe8] dark:border-white/10">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{group.name}</p>
          </div>
          {group.rows.map(row => (
            <div key={row.feature} className="grid grid-cols-4 px-5 py-3 border-t border-[#f5f5f5] items-center hover:bg-[#fafffe] dark:hover:bg-white/5 transition-colors">
              <span className="text-sm text-gray-700 dark:text-gray-300">{row.feature}</span>
              {[row.admin, row.manager, row.agent].map((has, i) => (
                <div key={i} className="flex justify-center">
                  {has
                    ? <CheckCircle size={16} className="text-[#1a5c3a]" />
                    : <X size={14} className="text-gray-300 dark:text-gray-600" />
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
