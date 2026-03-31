import AppLayout from '@/components/layout/app-layout';
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
