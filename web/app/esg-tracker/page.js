import dynamic from 'next/dynamic';

const EuropeESGMap = dynamic(
  () => import('@/components/EuropeESGMap'),
  { ssr: false }
);

export default function ESGTrackerPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <EuropeESGMap />
    </main>
  );
}
