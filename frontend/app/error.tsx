'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { StatePanel } from '@/components/StatePanel';

/**
 * Catches render-time failures, the most likely being the API not answering.
 * The message is deliberately about what the reader can do, not the stack.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // `reset()` alone re-renders from the cached payload and usually throws
  // straight back; the refresh is what actually re-runs the failed fetch.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <StatePanel
      level="h1"
      title="Something went wrong"
      message="The apartments service could not be reached. It may still be starting up."
    >
      <button onClick={retry} disabled={isPending} className="btn-primary">
        {isPending ? 'Retrying…' : 'Try again'}
      </button>
    </StatePanel>
  );
}
