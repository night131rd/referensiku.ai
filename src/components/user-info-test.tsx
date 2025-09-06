"use client";

import { useUserInfo } from "../hooks/useUserInfo";

export function UserInfoTest() {
  const { userInfo, loading, error } = useUserInfo();

  if (loading) {
    return <div>Loading user info...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold">User Info Test</h3>
      <p>Role: {userInfo.role}</p>
      <p>Authenticated: {userInfo.isAuthenticated ? 'Yes' : 'No'}</p>
      {userInfo.userId && <p>User ID: {userInfo.userId}</p>}
    </div>
  );
}
