'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon 
} from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface BackfillProgress {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  error?: string;
  result?: {
    snapshotsCreated: number;
    snapshotsSkipped: number;
    errors: string[];
  };
}

interface BackfillButtonProps {
  portfolioId: string;
  className?: string;
}

export function BackfillButton({ portfolioId, className }: BackfillButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [daysBack, setDaysBack] = useState('30');
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState<BackfillProgress | null>(null);
  const [polling, setPolling] = useState(false);

  // Check for existing job on mount
  useEffect(() => {
    checkExistingJob();
  }, [portfolioId]);

  // Poll for job status when job is running
  useEffect(() => {
    if (!polling || !jobStatus?.jobId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobStatus.jobId}`);
        if (response.ok) {
          const { data } = await response.json();
          setJobStatus(data);

          if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
            setPolling(false);
          }
        }
      } catch (error) {
        console.error('Failed to poll job status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [polling, jobStatus?.jobId]);

  const checkExistingJob = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/backfill?portfolio_id=${portfolioId}`);
      if (response.ok) {
        const { data } = await response.json();
        if (data && (data.status === 'pending' || data.status === 'running')) {
          setJobStatus(data);
          setPolling(true);
          setIsOpen(true);
        } else if (data) {
          setJobStatus(data);
        }
      }
    } catch (error) {
      console.error('Failed to check existing job:', error);
    }
  }, [portfolioId]);

  const startBackfill = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: portfolioId,
          days_back: parseInt(daysBack),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Start polling
        setJobStatus({
          jobId: result.job_id,
          status: 'pending',
          progress: 0,
          currentStep: 'Başlatılıyor...',
          completedSteps: 0,
          totalSteps: 0,
        });
        setPolling(true);
      } else if (response.status === 409) {
        // Job already running
        setJobStatus(result.job);
        setPolling(true);
      } else {
        console.error('Failed to start backfill:', result.error);
      }
    } catch (error) {
      console.error('Failed to start backfill:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async () => {
    if (!jobStatus?.jobId) return;

    try {
      await fetch(`/api/jobs/${jobStatus.jobId}`, {
        method: 'DELETE',
      });
      setPolling(false);
      setJobStatus(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const isRunning = jobStatus?.status === 'pending' || jobStatus?.status === 'running';
  const isCompleted = jobStatus?.status === 'completed';
  const isFailed = jobStatus?.status === 'failed';

  return (
    <>
      <Button
        outline
        onClick={() => setIsOpen(true)}
        className={clsx('gap-2', className)}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <Spinner size="sm" />
            <span>%{jobStatus?.progress || 0}</span>
          </>
        ) : (
          <>
            <ArrowPathIcon className="h-4 w-4" />
            <span>Geçmiş Verileri Doldur</span>
          </>
        )}
      </Button>

      <Dialog open={isOpen} onClose={() => !isRunning && setIsOpen(false)}>
        <DialogTitle>
          {isRunning ? 'Veriler Dolduruluyor...' : 'Geçmiş Verileri Doldur'}
        </DialogTitle>
        <DialogDescription>
          {isRunning 
            ? 'Lütfen bekleyin, geçmiş fiyatlar çekilip snapshot\'lar oluşturuluyor.'
            : 'Yahoo Finance\'den geçmiş fiyatları çekerek portföy değer geçmişini oluşturun.'}
        </DialogDescription>

        <DialogBody>
          {!isRunning && !isCompleted && !isFailed && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Kaç gün geriye gidilsin?
                </label>
                <Select
                  value={daysBack}
                  onChange={(e) => setDaysBack(e.target.value)}
                >
                  <option value="7">7 gün</option>
                  <option value="14">14 gün</option>
                  <option value="30">30 gün (Önerilen)</option>
                  <option value="60">60 gün</option>
                  <option value="90">90 gün</option>
                  <option value="180">180 gün</option>
                  <option value="365">365 gün</option>
                </Select>
              </div>

              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Not:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Bu işlem birkaç dakika sürebilir</li>
                  <li>Hafta sonları atlanacaktır (piyasalar kapalı)</li>
                  <li>Mevcut snapshot&apos;lar korunacaktır</li>
                  <li>İşlem arka planda çalışacaktır</li>
                </ul>
              </div>
            </div>
          )}

          {isRunning && jobStatus && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400">İlerleme</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    %{jobStatus.progress}
                  </span>
                </div>
                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${jobStatus.progress}%` }}
                  />
                </div>
              </div>

              {/* Current step */}
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <ClockIcon className="h-4 w-4" />
                <span>{jobStatus.currentStep}</span>
              </div>

              {/* Steps counter */}
              {jobStatus.totalSteps > 0 && (
                <div className="text-xs text-zinc-500">
                  Adım: {jobStatus.completedSteps} / {jobStatus.totalSteps}
                </div>
              )}
            </div>
          )}

          {isCompleted && jobStatus?.result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="font-medium">Tamamlandı!</span>
              </div>

              <div className="rounded-lg bg-zinc-100 dark:bg-zinc-800 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Oluşturulan snapshot:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {jobStatus.result.snapshotsCreated}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Atlanan:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {jobStatus.result.snapshotsSkipped}
                  </span>
                </div>
                {jobStatus.result.errors.length > 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    {jobStatus.result.errors.length} hata oluştu
                  </div>
                )}
              </div>
            </div>
          )}

          {isFailed && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <ExclamationCircleIcon className="h-5 w-5" />
                <span className="font-medium">Hata Oluştu</span>
              </div>

              {jobStatus?.error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-200">
                  {jobStatus.error}
                </div>
              )}
            </div>
          )}
        </DialogBody>

        <DialogActions>
          {isRunning ? (
            <Button plain onClick={cancelJob}>
              İptal Et
            </Button>
          ) : (
            <>
              <Button plain onClick={() => setIsOpen(false)}>
                Kapat
              </Button>
              {!isCompleted && !isFailed && (
                <Button onClick={startBackfill} disabled={loading}>
                  {loading ? <Spinner size="sm" /> : 'Başlat'}
                </Button>
              )}
              {(isCompleted || isFailed) && (
                <Button 
                  onClick={() => {
                    setJobStatus(null);
                  }}
                >
                  Yeniden Dene
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
