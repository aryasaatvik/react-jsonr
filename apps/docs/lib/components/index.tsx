import React, { ReactNode } from 'react';

// Form component
export const Form = ({ title, children, ...props }: { 
  title: string; 
  children: ReactNode;
  [key: string]: any;
}) => (
  <form {...props}>
    <h2>{title}</h2>
    <div className="form-body">{children}</div>
  </form>
);

// Input component
export const Input = ({ 
  label, 
  name, 
  type = 'text', 
  ...props 
}: {
  label: string;
  name: string;
  type?: string;
  id?: string;
  placeholder?: string;
  [key: string]: any;
}) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    {type === 'textarea' ? (
      <textarea id={name} name={name} {...props} />
    ) : (
      <input id={name} name={name} type={type} {...props} />
    )}
  </div>
);

// Button component
export const Button = ({ 
  label, 
  type = 'button', 
  ...props 
}: {
  label: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  id?: string;
  className?: string;
  [key: string]: any;
}) => (
  <button type={type} {...props}>{label}</button>
);

// Text component
export const Text = ({ 
  text, 
  ...props 
}: {
  text: string;
  [key: string]: any;
}) => <p {...props}>{text}</p>;

// UserProfile component
export const UserProfile = ({ 
  user, 
  children, 
  ...props 
}: {
  user?: {
    name?: string;
    role?: string;
    avatar?: string;
    [key: string]: any;
  };
  children: ReactNode;
  [key: string]: any;
}) => (
  <div className="user-profile" {...props}>
    <div className="profile-header">
      <img src={user?.avatar || '/default-avatar.png'} alt="User avatar" width={64} height={64} />
      <h2>{user?.name || 'Loading...'}</h2>
      {user?.role && <span className="role-badge">{user.role}</span>}
    </div>
    <div className="profile-content">
      {children}
    </div>
  </div>
);

// ProfileSection component
export const ProfileSection = ({ 
  title, 
  children, 
  ...props 
}: {
  title: string;
  children: ReactNode;
  [key: string]: any;
}) => (
  <div className="profile-section" {...props}>
    <h3>{title}</h3>
    <div className="section-content">{children}</div>
  </div>
);

// AdminPanel component
export const AdminPanel = ({ 
  user, 
  ...props 
}: {
  user: {
    id: string;
    accessLevel?: string;
    lastLogin?: string;
    [key: string]: any;
  };
  [key: string]: any;
}) => (
  <div className="admin-panel" {...props}>
    <h4>Admin Panel</h4>
    <div>User ID: {user.id}</div>
    <div>Access Level: {user.accessLevel}</div>
    <div>Last Login: {user.lastLogin}</div>
    <button className="admin-action">Access Logs</button>
    <button className="admin-action">Manage Permissions</button>
  </div>
); 