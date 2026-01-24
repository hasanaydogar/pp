'use client';

import clsx from 'clsx';

interface PasswordStrengthProps {
  password: string;
}

type StrengthLevel = 'weak' | 'medium' | 'strong';

function getPasswordStrength(password: string): {
  level: StrengthLevel;
  score: number;
  feedback: string;
} {
  if (!password) {
    return { level: 'weak', score: 0, feedback: '' };
  }

  let score = 0;

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character type checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Determine level
  let level: StrengthLevel;
  let feedback: string;

  if (score <= 2) {
    level = 'weak';
    feedback = 'Zayıf - Daha uzun ve karmaşık bir şifre seçin';
  } else if (score <= 4) {
    level = 'medium';
    feedback = 'Orta - Özel karakter ekleyin';
  } else {
    level = 'strong';
    feedback = 'Güçlü';
  }

  return { level, score, feedback };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { level, score, feedback } = getPasswordStrength(password);

  if (!password) return null;

  const maxScore = 6;
  const percentage = (score / maxScore) * 100;

  return (
    <div className="mt-2 space-y-1">
      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-300',
            {
              'bg-red-500': level === 'weak',
              'bg-yellow-500': level === 'medium',
              'bg-green-500': level === 'strong',
            }
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Feedback Text */}
      <p
        className={clsx('text-xs', {
          'text-red-600 dark:text-red-400': level === 'weak',
          'text-yellow-600 dark:text-yellow-400': level === 'medium',
          'text-green-600 dark:text-green-400': level === 'strong',
        })}
      >
        {feedback}
      </p>
    </div>
  );
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Şifre en az 8 karakter olmalı';
  }
  return null;
}
