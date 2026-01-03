'use client';

import { useExchangeRates, formatLastUpdate, areRatesStale } from '@/lib/hooks/use-exchange-rates';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function TestExchangeRatesPage() {
  const { data: rates, isLoading, error, refetch, isFetching } = useExchangeRates();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Exchange Rate API Test</h1>

      {/* Status Section */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Status</h2>
        <div className="space-y-2">
          <p>
            <strong>Loading:</strong>{' '}
            <span className={isLoading ? 'text-yellow-600' : 'text-green-600'}>
              {isLoading ? 'Yes' : 'No'}
            </span>
          </p>
          <p>
            <strong>Fetching:</strong>{' '}
            <span className={isFetching ? 'text-yellow-600' : 'text-green-600'}>
              {isFetching ? 'Yes (background)' : 'No'}
            </span>
          </p>
          <p>
            <strong>Error:</strong>{' '}
            <span className={error ? 'text-red-600' : 'text-green-600'}>
              {error ? error.message : 'None'}
            </span>
          </p>
          {rates && (
            <>
              <p>
                <strong>Last Update:</strong> {formatLastUpdate(rates)}
              </p>
              <p>
                <strong>Stale:</strong>{' '}
                <span className={areRatesStale(rates) ? 'text-yellow-600' : 'text-green-600'}>
                  {areRatesStale(rates) ? 'Yes' : 'No'}
                </span>
              </p>
              <p>
                <strong>Base Currency:</strong> {rates.base}
              </p>
              <p>
                <strong>Total Currencies:</strong> {Object.keys(rates.rates).length}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-3">
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? (
            <>
              <Spinner className="mr-2" />
              Refreshing...
            </>
          ) : (
            'Refresh Rates'
          )}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Spinner className="mr-3" />
          <span className="text-lg">Loading exchange rates...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Rates
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-2">{error.message}</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Error Type: {error.type}
          </p>
          {error.statusCode && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Status Code: {error.statusCode}
            </p>
          )}
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Troubleshooting:</strong>
            </p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside mt-2">
              <li>Check if NEXT_PUBLIC_EXCHANGE_RATE_API_KEY is set in .env.local</li>
              <li>Verify API key is valid at exchangerate-api.com</li>
              <li>Check network connection</li>
              <li>Check browser console for more details</li>
            </ul>
          </div>
        </div>
      )}

      {/* Success State - Popular Currencies */}
      {rates && !error && (
        <div className="space-y-6">
          {/* Popular Currencies */}
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Popular Currencies (1 USD =)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { code: 'EUR', name: 'Euro' },
                { code: 'GBP', name: 'British Pound' },
                { code: 'JPY', name: 'Japanese Yen' },
                { code: 'TRY', name: 'Turkish Lira' },
                { code: 'CAD', name: 'Canadian Dollar' },
                { code: 'AUD', name: 'Australian Dollar' },
                { code: 'CHF', name: 'Swiss Franc' },
                { code: 'CNY', name: 'Chinese Yuan' },
              ].map(({ code, name }) => (
                <div
                  key={code}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                >
                  <div className="text-sm text-gray-600 dark:text-gray-400">{name}</div>
                  <div className="text-lg font-semibold">
                    {rates.rates[code]?.toFixed(4) || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">{code}</div>
                </div>
              ))}
            </div>
          </div>

          {/* All Currencies Table */}
          <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              All Currencies ({Object.keys(rates.rates).length})
            </h2>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="text-left p-2">Currency Code</th>
                    <th className="text-right p-2">Rate (1 USD =)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(rates.rates)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([code, rate]) => (
                      <tr
                        key={code}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="p-2 font-mono">{code}</td>
                        <td className="p-2 text-right font-mono">{rate.toFixed(6)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Raw Data */}
          <details className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <summary className="cursor-pointer text-lg font-semibold mb-2">
              Raw API Response (Click to expand)
            </summary>
            <pre className="text-xs overflow-x-auto p-3 bg-gray-900 text-green-400 rounded">
              {JSON.stringify(rates, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
