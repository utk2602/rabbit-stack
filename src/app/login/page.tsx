import LoginUI from '../../components/login-ui';
import { UnAuth } from '../../components/UnAuth';

export default function LoginPage() {
  return (
    <UnAuth>
      <LoginUI />
    </UnAuth>
  );
}
