import { AuthPage } from '../../components/auth-page';
import { UnAuth } from '../../components/UnAuth';

export default function LoginPage() {
  return (
    <UnAuth>
      <AuthPage />
    </UnAuth>
  );
}
