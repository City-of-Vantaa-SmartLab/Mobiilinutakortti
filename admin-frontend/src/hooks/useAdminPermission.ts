import { useEffect, useState } from 'react';
import { authProvider } from '../providers';

const useAdminPermission = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const getPermissions = async () => {
    try {
      const permissions = await authProvider.getPermissions({});
      setIsSignedIn(permissions === 'ADMIN' || permissions === 'YOUTHWORKER');
      setIsAdmin(permissions === 'ADMIN');
    } catch {
      // It's fine if there's no permission info yet (user hasn't logged in).
    }
  };

  useEffect(() => {
    getPermissions();
  });

  return {
    isAdmin,
    isSignedIn
  };
};

export default useAdminPermission;
