export function AuthDivider({ text = 'veya' }: { text?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
          {text}
        </span>
      </div>
    </div>
  );
}
