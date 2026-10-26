
import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import AdminOrders from "./AdminOrders";

function Admin({ token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    price: "",
    category: "Electronics",
    stock: "",
    image: "",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadProducts() {
    try {
      const data = await apiRequest("/api/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!form.name.trim() || !form.description.trim()) {
      setMessage("Please enter the product name and description.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setMessage("Please enter a valid price.");
      return;
    }

    if (
      form.stock === "" ||
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setMessage("Please enter a valid whole-number stock quantity.");
      return;
    }

    const productData = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image.trim(),
    };

    try {
      setSaving(true);

      const path = editingId
        ? `/api/products/${editingId}`
        : "/api/products";

      await apiRequest(
        path,
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(productData),
        },
        token
      );

      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product added successfully."
      );

      setForm({ ...emptyForm });
      setEditingId(null);

      await loadProducts();
    } catch (error) {
      setMessage(error.message || "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product) {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      category: product.category || "Electronics",
      stock: String(product.stock ?? ""),
      image: product.image || "",
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteProduct(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setMessage("");

    try {
      await apiRequest(
        `/api/products/${productId}`,
        { method: "DELETE" },
        token
      );

      setMessage("Product deleted successfully.");
      await loadProducts();

      if (editingId === productId) {
        cancelEdit();
      }
    } catch (error) {
      setMessage(error.message || "Could not delete product.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage("");
  }

  return (
    <>
      <section className="products-section admin-section">
        <p className="eyebrow">SHOPNEXIS MANAGEMENT</p>

        <h2>Admin Dashboard</h2>

        <p className="admin-description">
          Add products, update prices and stock, or remove products.
        </p>

        {message && (
          <p className="message admin-message" role="status">
            {message}
          </p>
        )}

        <form className="admin-product-form" onSubmit={handleSubmit}>
          <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>

          <label>
            Product name
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the product"
              rows={3}
              required
            />
          </label>

          <label>
            Price (₹)
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price"
              required
            />
          </label>

          <label>
            Category
            <input
              name="category"
              type="text"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Electronics"
              required
            />
          </label>

          <label>
            Stock quantity
            <input
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              required
            />
          </label>

          <label>
            Image URL (optional)
            <input
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/product.jpg"
            />
          </label>

          <div className="admin-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                className="admin-cancel-button"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="admin-products-heading">
          <h3>Existing Products ({products.length})</h3>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found. Add your first product above.</p>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product._id}>
                <div className="product-info">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="admin-product-image"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <p>
                    Price: ₹
                    {Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <p>Stock: {product.stock}</p>

                  <div className="admin-product-actions">
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={() => deleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <AdminOrders token={token} />
    </>
  );
}

export default Admin;
