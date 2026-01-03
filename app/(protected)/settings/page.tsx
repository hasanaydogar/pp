export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-950 dark:text-white">Settings</h1>
        <p className="mt-2 text-base/6 text-zinc-600 dark:text-zinc-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div className="px-6 py-4 border-b border-zinc-950/5 dark:border-white/10">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Profile</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm/6 font-medium text-zinc-950 dark:text-white mb-2">
                Display Name
              </label>
              <input
                type="text"
                defaultValue="Hasan Aydoğar"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base/6 text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-400"
              />
            </div>
            <div>
              <label className="block text-sm/6 font-medium text-zinc-950 dark:text-white mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue="hasanaydogar@gmail.com"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base/6 text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div className="px-6 py-4 border-b border-zinc-950/5 dark:border-white/10">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Preferences</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-base/6 font-medium text-zinc-950 dark:text-white">Dark Mode</label>
                <p className="text-sm/6 text-zinc-600 dark:text-zinc-400">Enable dark mode theme</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-base/6 font-medium text-zinc-950 dark:text-white">Email Notifications</label>
                <p className="text-sm/6 text-zinc-600 dark:text-zinc-400">Receive email updates about your portfolio</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-base/6 font-medium text-zinc-950 dark:text-white">Currency</label>
                <p className="text-sm/6 text-zinc-600 dark:text-zinc-400">Default currency for displaying values</p>
              </div>
              <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base/6 text-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
                <option>USD</option>
                <option>EUR</option>
                <option>TRY</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-xs ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
          <div className="px-6 py-4 border-b border-zinc-950/5 dark:border-white/10">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">Security</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm/6 font-medium text-zinc-950 dark:text-white mb-2">
                Change Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base/6 text-zinc-950 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-400"
              />
            </div>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm/6 font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-zinc-900">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
