import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize demo account if no users exist
    const users = JSON.parse(localStorage.getItem('bertLocker_users') || '[]');
    if (users.length === 0) {
      const demoUser = {
        id: 'demo-user-1',
        email: 'demo@example.com',
        password: 'demo123',
        name: 'Demo User'
      };
      localStorage.setItem('bertLocker_users', JSON.stringify([demoUser]));
    }

    // Check for saved user session
    const savedUser = localStorage.getItem('bertLocker_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
        localStorage.removeItem('bertLocker_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('bertLocker_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userWithoutPassword = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name
        };
        setUser(userWithoutPassword);
        localStorage.setItem('bertLocker_user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('bertLocker_users') || '[]');
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        return false;
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name
      };
      
      users.push(newUser);
      localStorage.setItem('bertLocker_users', JSON.stringify(users));
      
      const userWithoutPassword = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      };
      setUser(userWithoutPassword);
      localStorage.setItem('bertLocker_user', JSON.stringify(userWithoutPassword));
      return true;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bertLocker_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}