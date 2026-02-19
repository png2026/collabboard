export default function UserList({ presenceUsers, currentUser, myColor }) {
  const allUsers = [
    // Current user always first
    {
      id: currentUser?.uid ?? 'me',
      displayName: currentUser?.displayName || currentUser?.email || 'You',
      color: myColor,
      isMe: true,
    },
    ...presenceUsers,
  ];

  return (
    <div className="fixed top-16 left-4 z-40">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 min-w-[160px]">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Online ({allUsers.length})
        </p>
        <div className="space-y-2">
          {allUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white"
                style={{ backgroundColor: user.color || '#9CA3AF' }}
              />
              <span className="text-sm text-gray-700 truncate">
                {user.displayName}
                {user.isMe && (
                  <span className="text-gray-400 ml-1">(you)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
