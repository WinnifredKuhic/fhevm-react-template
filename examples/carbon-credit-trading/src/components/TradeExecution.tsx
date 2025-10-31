import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { formatAddress, formatTimestamp } from '../lib/contract';
import { OrderInfo, CreditInfo } from '../types';

interface OrderWithDetails extends OrderInfo {
  orderId: number;
}

export const TradeExecution: React.FC = () => {
  const { wallet } = useWallet();
  const { getSystemStats, getCreditInfo, getOrderInfo, getMyOrderIds, cancelOrder, executeTrade } =
    useContract();
  const [availableCredits, setAvailableCredits] = useState<
    Array<{ id: number; info: CreditInfo }>
  >([]);
  const [userOrders, setUserOrders] = useState<OrderWithDetails[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAvailableCredits = async () => {
    try {
      setLoading(true);
      const stats = await getSystemStats();
      const totalCredits = Number(stats.totalCredits);

      if (totalCredits === 0) {
        setAvailableCredits([]);
        return;
      }

      const credits: Array<{ id: number; info: CreditInfo }> = [];

      for (let i = 1; i <= totalCredits; i++) {
        try {
          const creditInfo = await getCreditInfo(i);
          if (creditInfo.isActive) {
            credits.push({ id: i, info: creditInfo });
          }
        } catch (err) {
          console.error(`Error loading credit ${i}:`, err);
        }
      }

      setAvailableCredits(credits);
    } catch (err) {
      console.error('Error loading credits:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async () => {
    if (!wallet.address) return;

    try {
      const orderIds = await getMyOrderIds();
      const orders: OrderWithDetails[] = [];

      for (const orderId of orderIds) {
        try {
          const orderInfo = await getOrderInfo(Number(orderId));
          orders.push({
            ...orderInfo,
            orderId: Number(orderId),
          });
        } catch (err) {
          console.error(`Error loading order ${orderId}:`, err);
        }
      }

      setUserOrders(orders);
    } catch (err) {
      console.error('Error loading user orders:', err);
    }
  };

  const loadPendingOrders = async () => {
    if (!wallet.address) return;

    try {
      const stats = await getSystemStats();
      const totalOrders = Number(stats.totalOrders);

      if (totalOrders === 0) {
        setPendingOrders([]);
        return;
      }

      const orders: OrderWithDetails[] = [];

      for (let i = 1; i <= totalOrders; i++) {
        try {
          const orderInfo = await getOrderInfo(i);

          if (
            orderInfo.seller.toLowerCase() === wallet.address.toLowerCase() &&
            orderInfo.isActive &&
            !orderInfo.isFulfilled
          ) {
            orders.push({
              ...orderInfo,
              orderId: i,
            });
          }
        } catch (err) {
          console.error(`Error loading order ${i}:`, err);
        }
      }

      setPendingOrders(orders);
    } catch (err) {
      console.error('Error loading pending orders:', err);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await cancelOrder(orderId);
      alert('Order cancelled successfully!');
      await loadUserOrders();
    } catch (err: any) {
      alert(`Failed to cancel order: ${err.message || 'Unknown error'}`);
    }
  };

  const handleExecuteTrade = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to execute this trade?')) {
      return;
    }

    try {
      await executeTrade(orderId);
      alert('Trade executed successfully!');
      await Promise.all([loadPendingOrders(), loadUserOrders()]);
    } catch (err: any) {
      alert(`Failed to execute trade: ${err.message || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    loadAvailableCredits();
    loadUserOrders();
    loadPendingOrders();
  }, [wallet.address]);

  return (
    <>
      <div className="card">
        <h2>Available Credits</h2>
        <div className="credits-list">
          {loading ? (
            <p className="loading">Loading available credits...</p>
          ) : availableCredits.length === 0 ? (
            <p>No credits available yet.</p>
          ) : (
            availableCredits.map((credit) => (
              <div key={credit.id} className="credit-item">
                <h4>Credit ID: {credit.id}</h4>
                <p>
                  <strong>Issuer:</strong> {formatAddress(credit.info.issuer)}
                </p>
                <p>
                  <strong>Project Type:</strong> {credit.info.projectType}
                </p>
                <p>
                  <strong>Issued:</strong> {formatTimestamp(credit.info.timestamp)}
                </p>
                <p>
                  <strong>Verification Hash:</strong> {credit.info.verificationHash}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h2>My Orders</h2>
        <div className="orders-list">
          {userOrders.length === 0 ? (
            <p>You have no orders yet.</p>
          ) : (
            userOrders.map((order) => (
              <div key={order.orderId} className="order-item">
                <h4>Order ID: {order.orderId}</h4>
                <p>
                  <strong>Credit ID:</strong> {Number(order.creditId)}
                </p>
                <p>
                  <strong>Seller:</strong> {formatAddress(order.seller)}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  {order.isFulfilled ? 'Fulfilled' : order.isActive ? 'Active' : 'Cancelled'}
                </p>
                <p>
                  <strong>Created:</strong> {formatTimestamp(order.timestamp)}
                </p>
                {order.isActive && !order.isFulfilled && (
                  <div className="order-actions">
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancelOrder(order.orderId)}
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h2>Pending Orders (Sellers)</h2>
        <div className="orders-list">
          {pendingOrders.length === 0 ? (
            <p>No pending orders for you as a seller.</p>
          ) : (
            pendingOrders.map((order) => (
              <div key={order.orderId} className="order-item">
                <h4>Order ID: {order.orderId}</h4>
                <p>
                  <strong>Buyer:</strong> {formatAddress(order.buyer)}
                </p>
                <p>
                  <strong>Credit ID:</strong> {Number(order.creditId)}
                </p>
                <p>
                  <strong>Created:</strong> {formatTimestamp(order.timestamp)}
                </p>
                <div className="order-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleExecuteTrade(order.orderId)}
                  >
                    Execute Trade
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
