import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

const Home = async () => {
  const { user, profile } = await requireAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Device Tracking</h1>
        <p className="text-muted-foreground mb-4">
          Welcome, {profile.full_name || profile.email}!
        </p>
        <div className="text-sm text-gray-500">
          Role: <span className="font-semibold">{profile.role}</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
