import Link from 'next/link';
import { StatePanel } from '@/components/StatePanel';

export default function NotFound() {
  return (
    <StatePanel
      level="h1"
      title="Apartment not found"
      message="This unit may have been removed, or the link is incorrect."
    >
      <Link href="/" className="btn-primary">
        Back to listing
      </Link>
    </StatePanel>
  );
}
