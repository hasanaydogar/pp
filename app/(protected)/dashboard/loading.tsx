import { Spinner } from '@/components/ui/spinner';

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
      </div>
    </div>
  );
}

