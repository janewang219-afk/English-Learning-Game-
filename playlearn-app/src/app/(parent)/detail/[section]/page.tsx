import ParentDetailScreen from '@/components/parent/ParentDetailScreen';

export default function ParentDetailPage({ params }: { params: { section: string } }) {
  return <ParentDetailScreen section={params.section} />;
}

