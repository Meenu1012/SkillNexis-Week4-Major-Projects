import { useEffect, useState } from "react";
import { apiRequest } from "./api";

const ORDER_STATUSES = [
  "Placed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function AdminOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");

  async function loadOrders() {
    setLoading(true);
    setMessage("");

    try {
      const data = await apiRequest(
        "/api/orders/admin/all",
        {},
        token
      );

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Could not load customer orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  async function updateStatus(orderId, status) {
    setSavingId(orderId);
    setMessage("");

    try {
      const data = await apiRequest(
        `/api/orders/admin/${orderId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        token
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? { ...order, ...data.order }
            : order
        )
      );

      setMessage("Order status updated successfully.");
    } catch (error) {
      setMessage(error.message || "Could not update order status.");
      await loadOrders();
    } finally {
      setSavingId("");
    }
  }

  return (
    <section className="products-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SHOPNEXIS MANAGEMENT</p>
          <h2>Customer Orders</h2>
          <p>View orders and update their delivery status.</p>
        </div>

        <button onClick={loadOrders} disabled={loading}>
          {loading ? "Loading..." : "Refresh Orders"}
        </button>
      </div>

      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}

      {loading ? (
        <p>Loading customer orders...</p>
      ) : orders.length === 0 ? (
        <p>No customer orders found yet.</p>
      ) : (
        <div className="product-grid">
          {orders.map((order) => (
            <article className="product-card" key={order._id}>
              <div className="product-info">
                <h3>Order #{order._id}</h3>

                <p>
                  <strong>Customer:</strong>{" "}
                  {order.user?.name || "Customer"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {order.user?.email || "Not available"}
                </p>

                <p>
                  <strong>Total:</strong>{" "}
                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </p>

                <p>
                  <strong>Payment:</strong>{" "}
                  {order.paymentMethod || "COD"}
                </p>

                <p>
                  <strong>Shipping address:</strong>{" "}
                  {order.shippingAddress}
                </p>

                <p>
                  <strong>Order items:</strong>
                </p>

                <ul>
                  {order.items?.map((item, index) => (
                    <li key={`${order._id}-${index}`}>
                      {item.name} × {item.quantity} — ₹
                      {Number(
                        item.price * item.quantity
                      ).toLocaleString("en-IN")}
                    </li>
                  ))}
                </ul>

                <p>
                  <strong>Order date:</strong>{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString("en-IN")
                    : "Not available"}
                </p>

                <label>
                  Order status
                  <select
                    value={order.status}
                    disabled={savingId === order._id}
                    onChange={(event) =>
                      updateStatus(order._id, event.target.value)
                    }
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                {savingId === order._id && (
                  <p>Saving status...</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminOrders;