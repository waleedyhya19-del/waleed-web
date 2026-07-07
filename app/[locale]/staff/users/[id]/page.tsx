import { UserDetailView } from '@/components/users/user-detail-view';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailView id={id} />;
}
