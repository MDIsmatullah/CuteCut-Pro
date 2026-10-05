export * from './auth/CreatorSignInModal';
import { CreatorSignInModal } from './auth/CreatorSignInModal';
export default CreatorSignInModal;
export interface UserProfile {
  name: string;
  email: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  avatar?: string;
  uid?: string;
}
