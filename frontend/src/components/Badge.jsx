const Badge = ({ type, children }) => {
  const classMap = {
    admin: 'badge badge-admin',
    manager: 'badge badge-manager',
    user: 'badge badge-user',
    active: 'badge badge-active',
    inactive: 'badge badge-inactive',
  };
  const dotMap = {
    admin: '◆',
    manager: '◈',
    user: '○',
    active: '●',
    inactive: '○',
  };
  return (
    <span className={classMap[type] || 'badge'}>
      {dotMap[type]} {children}
    </span>
  );
};

export default Badge;
