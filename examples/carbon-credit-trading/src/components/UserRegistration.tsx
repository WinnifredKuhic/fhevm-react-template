import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';

interface UserRegistrationProps {
  onRegistrationChange?: (isRegistered: boolean) => void;
}

export const UserRegistration: React.FC<UserRegistrationProps> = ({
  onRegistrationChange,
}) => {
  const { wallet } = useWallet();
  const { registerUser, isUserRegistered } = useContract();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'loading';
  } | null>(null);

  useEffect(() => {
    const checkRegistration = async () => {
      if (wallet.address) {
        try {
          const registered = await isUserRegistered(wallet.address);
          setIsRegistered(registered);
          onRegistrationChange?.(registered);

          if (registered) {
            setMessage({
              text: 'User is already registered',
              type: 'success',
            });
          } else {
            setMessage({
              text: 'User not registered. Please register to continue.',
              type: 'error',
            });
          }
        } catch (err) {
          console.error('Error checking registration:', err);
        }
      }
    };

    checkRegistration();
  }, [wallet.address, isUserRegistered, onRegistrationChange]);

  const handleRegister = async () => {
    if (!wallet.address) {
      setMessage({
        text: 'Please connect your wallet first',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      setMessage({
        text: 'Registering user...',
        type: 'loading',
      });

      await registerUser();

      setIsRegistered(true);
      setMessage({
        text: 'User registered successfully!',
        type: 'success',
      });
      onRegistrationChange?.(true);
    } catch (err: any) {
      setMessage({
        text: `Registration failed: ${err.message || 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>User Registration</h2>
      <p>Register to start trading carbon credits on the platform.</p>
      <button
        id="registerUser"
        className="btn btn-primary"
        onClick={handleRegister}
        disabled={loading || isRegistered || !wallet.address}
      >
        {loading ? 'Registering...' : isRegistered ? 'Already Registered' : 'Register User'}
      </button>
      {message && (
        <div className={`status-message ${message.type}`}>{message.text}</div>
      )}
    </div>
  );
};
