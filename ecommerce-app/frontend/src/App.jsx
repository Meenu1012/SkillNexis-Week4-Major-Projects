
import { useEffect, useState } from "react";
import "./App.css";
import Auth from "./Auth";
import { apiRequest } from "./api";
import Admin from "./Admin";

const categoryData = {
  Women: [
    "All",
    "Sarees",
    "Kurtis",
    "Dresses",
    "Tops",
    "Ethnic Sets",
    "Jeans",
    "Handbags",
  ],
  Men: [
    "All",
    "Shirts",
    "T-Shirts",
    "Jeans",
    "Trousers",
    "Ethnic Wear",
    "Shoes",
  ],
  Kids: [
    "All",
    "Boys Wear",
    "Girls Wear",
    "Baby Clothing",
    "Kids Footwear",
  ],
  Footwear: [
    "All",
    "Sneakers",
    "Sandals",
    "Heels",
    "Flats",
    "Formal Shoes",
  ],
  Beauty: [
    "All",
    "Skincare",
    "Makeup",
    "Hair Care",
    "Fragrances",
  ],
  Accessories: [
    "All",
    "Handbags",
    "Sunglasses",
    "Watches",
    "Jewellery",
  ],
  "Home & Kitchen": [
    "All",
    "Kitchen Storage",
    "Cookware",
    "Home Decor",
    "Bedsheets",
    "Organizers",
  ],
  Electronics: [
    "All",
    "Mobiles",
    "Headphones",
    "Keyboards",
    "Mice",
    "Smartwatches",
  ],
};

const categoryKeywords = {
  Sarees: ["saree", "sari"],
  Kurtis: ["kurti", "kurta"],
  Dresses: ["dress", "gown"],
  Tops: ["top", "blouse"],
  "Ethnic Sets": ["ethnic set", "salwar", "suit set"],
  Jeans: ["jeans", "denim"],
  Handbags: ["handbag", "hand bag", "purse"],
  Shirts: ["shirt"],
  "T-Shirts": ["t-shirt", "tshirt", "tee"],
  Trousers: ["trouser", "pants"],
  "Ethnic Wear": ["ethnic", "kurta", "traditional"],
  Shoes: ["shoe", "shoes"],
  "Boys Wear": ["boys", "boy wear"],
  "Girls Wear": ["girls", "girl wear"],
  "Baby Clothing": ["baby", "infant"],
  "Kids Footwear": ["kids footwear", "children shoe"],
  Sneakers: ["sneaker", "sports shoe"],
  Sandals: ["sandal"],
  Heels: ["heel"],
  Flats: ["flat footwear", "flats"],
  "Formal Shoes": ["formal shoe", "formal shoes"],
  Skincare: ["skincare", "skin care", "face wash", "moisturizer"],
  Makeup: ["makeup", "lipstick", "foundation", "mascara"],
  "Hair Care": ["hair care", "shampoo", "conditioner"],
  Fragrances: ["perfume", "fragrance", "deodorant"],
  Sunglasses: ["sunglasses", "sun glasses"],
  Watches: ["watch"],
  Jewellery: ["jewellery", "jewelry", "necklace", "earring"],
  "Kitchen Storage": ["kitchen storage", "storage container"],
  Cookware: ["cookware", "cooking pan", "pot"],
  "Home Decor": ["home decor", "decoration", "wall decor"],
  Bedsheets: ["bedsheet", "bed sheet"],
  Organizers: ["organizer", "organiser"],
  Mobiles: ["mobile", "smartphone", "phone"],
  Headphones: ["headphone", "earphone", "earbud"],
  Keyboards: ["keyboard"],
  Mice: ["mouse", "computer mouse"],
  Smartwatches: ["smartwatch", "smart watch"],
};

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ecommerceUser") || "null");
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("ecommerceToken") || ""
  );

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await apiRequest("/api/products");
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setError("Could not connect to the store. Check your backend.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  async function loadCart(loginToken = token) {
    if (!loginToken) {
      setCart([]);
      return;
    }

    try {
      const data = await apiRequest("/api/cart", {}, loginToken);
      setCart(data.items || []);
    } catch (error) {
      setMessage(error.message || "Could not load your cart.");
    }
  }

  async function loadOrders(loginToken = token) {
    try {
      const data = await apiRequest("/api/orders", {}, loginToken);
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      setMessage(error.message || "Could not load your orders.");
    }
  }

  useEffect(() => {
    if (token) {
      loadCart(token);
    } else {
      setCart([]);
    }
  }, [token]);

  function handleLogin(loggedInUser, loginToken) {
    setUser(loggedInUser);
    setToken(loginToken);
    setShowAdmin(false);
    setMessage("Login successful!");
  }

  function handleLogout() {
    localStorage.removeItem("ecommerceToken");
    localStorage.removeItem("ecommerceUser");

    setUser(null);
    setToken("");
    setCart([]);
    setOrders([]);
    setShowCart(false);
    setShowOrders(false);
    setShowAdmin(false);
    setShippingAddress("");
    setMessage("You have logged out.");
  }

  async function addToCart(product) {
    if (!token) {
      setMessage("Please login before adding products to your cart.");
      document.getElementById("account")?.scrollIntoView();
      return;
    }

    try {
      const existing = cart.find(
        (item) => (item.product?._id || item.product) === product._id
      );

      await apiRequest(
        "/api/cart",
        {
          method: "POST",
          body: JSON.stringify({
            productId: product._id,
            quantity: existing ? existing.quantity + 1 : 1,
          }),
        },
        token
      );

      await loadCart(token);
      setMessage(`${product.name} added to your cart.`);
    } catch (error) {
      setMessage(error.message || "Could not add the product.");
    }
  }

  async function updateQuantity(productId, quantity) {
    try {
      if (quantity < 1) {
        await removeFromCart(productId);
        return;
      }

      await apiRequest(
        `/api/cart/${productId}`,
        {
          method: "PUT",
          body: JSON.stringify({ quantity }),
        },
        token
      );

      await loadCart(token);
    } catch (error) {
      setMessage(error.message || "Could not update quantity.");
    }
  }

  async function removeFromCart(productId) {
    try {
      await apiRequest(
        `/api/cart/${productId}`,
        { method: "DELETE" },
        token
      );

      await loadCart(token);
      setMessage("Item removed from cart.");
    } catch (error) {
      setMessage(error.message || "Could not remove item.");
    }
  }

  async function checkout(event) {
    event.preventDefault();

    if (!shippingAddress.trim()) {
      setMessage("Please enter your shipping address.");
      return;
    }

    try {
      await apiRequest(
        "/api/orders/checkout",
        {
          method: "POST",
          body: JSON.stringify({ shippingAddress }),
        },
        token
      );

      await loadCart(token);
      await loadOrders(token);
      setShippingAddress("");
      setShowCart(false);
      setShowOrders(true);
      setMessage(
        "Order placed successfully! Payment method: Cash on Delivery."
      );
    } catch (error) {
      setMessage(error.message || "Checkout failed.");
    }
  }

  function toggleCart() {
    setShowCart(!showCart);
    setShowOrders(false);
    setShowAdmin(false);
  }

  async function toggleOrders() {
    const shouldShowOrders = !showOrders;

    setShowOrders(shouldShowOrders);
    setShowCart(false);
    setShowAdmin(false);

    if (shouldShowOrders) {
      await loadOrders(token);
    }
  }

  function toggleAdmin() {
    setShowAdmin(!showAdmin);
    setShowCart(false);
    setShowOrders(false);
  }

  function chooseCategory(category) {
    setSelectedCategory(category);
    setSelectedSubcategory("All");
    setShowCart(false);
    setShowOrders(false);
    setShowAdmin(false);
  }

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cart.reduce((sum, item) => {
    const product = item.product;
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  const visibleSubcategories =
    selectedCategory === "All"
      ? []
      : categoryData[selectedCategory] || ["All"];

  const filteredProducts = products.filter((product) => {
    const name = (product.name || "").toLowerCase();
    const description = (product.description || "").toLowerCase();
    const category = (product.category || "").toLowerCase();
    const subcategory = (product.subcategory || "").toLowerCase();
    const search = searchText.trim().toLowerCase();

    const matchesSearch =
      !search ||
      name.includes(search) ||
      description.includes(search) ||
      category.includes(search) ||
      subcategory.includes(search);

    const categoryGroups = {
  Women: [
    "women", "woman", "sarees", "saree", "sari",
    "kurtis", "kurti", "dresses", "dress", "tops",
    "ethnic sets", "jeans", "handbags"
  ],
  Men: [
    "men", "man", "shirts", "shirt", "t-shirts",
    "t-shirt", "jeans", "trousers", "ethnic wear",
    "shoes"
  ],
  Kids: [
    "kids", "kid", "boys wear", "girls wear",
    "baby clothing", "kids footwear"
  ],
  Footwear: [
    "footwear", "sneakers", "sandals", "heels",
    "flats", "formal shoes"
  ],
  Beauty: [
    "beauty", "skincare", "makeup", "hair care",
    "fragrances"
  ],
  Accessories: [
    "accessories", "handbags", "sunglasses",
    "watches", "jewellery"
  ],
  "Home & Kitchen": [
    "home & kitchen", "kitchen storage", "cookware",
    "home decor", "bedsheets", "organizers"
  ],
  Electronics: [
    "electronics", "mobiles", "headphones",
    "keyboards", "mice", "smartwatches"
  ]
};

const matchesCategory =
  selectedCategory === "All" ||
  category === selectedCategory.toLowerCase() ||
  subcategory === selectedCategory.toLowerCase() ||
  (categoryGroups[selectedCategory] || []).some(
    (item) => item === category || item === subcategory
  );
    const keywords = categoryKeywords[selectedSubcategory] || [
      selectedSubcategory.toLowerCase(),
    ];

    const matchesSubcategory =
      selectedSubcategory === "All" ||
      subcategory === selectedSubcategory.toLowerCase() ||
      keywords.some(
        (keyword) =>
          name.includes(keyword) || description.includes(keyword)
      );

    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  return (
    <div className="store">
      <header className="navbar">
        <a className="brand" href="/">
          ShopNexis<span>.</span>
        </a>

        <nav>
          <a href="#products">Products</a>
          <a href="#about">About</a>
        </nav>

        <div>
          {user ? (
            <>
              <span>Hi, {user.name}</span>{" "}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <a href="#account">Login / Register</a>
          )}
        </div>

        <button className="cart-button" onClick={toggleCart}>
          🛒 Cart <span>{cartCount}</span>
        </button>
      </header>

      <nav className="category-navigation" aria-label="Shop categories">
        <button
          className={selectedCategory === "All" ? "active" : ""}
          onClick={() => chooseCategory("All")}
        >
          All Products
        </button>

        {Object.keys(categoryData).map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? "active" : ""}
            onClick={() => chooseCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <main>
        {!user && (
          <div id="account">
            <Auth onLogin={handleLogin} />
          </div>
        )}

        {message && (
          <p className="message" role="status">
            {message}
            <button onClick={() => setMessage("")}>✕</button>
          </p>
        )}

        {user && (
          <div className="section-heading">
            <button onClick={toggleCart}>My Cart ({cartCount})</button>
            <button onClick={toggleOrders}>My Orders</button>

            {user.role === "admin" && (
              <button onClick={toggleAdmin}>
                {showAdmin ? "Close Admin" : "Admin Dashboard"}
              </button>
            )}
          </div>
        )}

        {showAdmin && user?.role === "admin" && (
          <Admin token={token} />
        )}

        {showCart && user && (
          <section className="products-section">
            <h2>Your Shopping Cart</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => {
                  const product = item.product;

                  if (!product || typeof product !== "object") {
                    return null;
                  }

                  return (
                    <article className="product-card" key={product._id}>
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p>
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>
                        <p>Quantity: {item.quantity}</p>

                        <button
                          onClick={() =>
                            updateQuantity(product._id, item.quantity - 1)
                          }
                        >
                          −
                        </button>{" "}

                        <button
                          onClick={() =>
                            updateQuantity(product._id, item.quantity + 1)
                          }
                        >
                          +
                        </button>{" "}

                        <button onClick={() => removeFromCart(product._id)}>
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                })}

                <h3>
                  Total: ₹{Number(cartTotal).toLocaleString("en-IN")}
                </h3>

                <form onSubmit={checkout}>
                  <label>
                    Shipping address
                    <textarea
                      value={shippingAddress}
                      onChange={(event) =>
                        setShippingAddress(event.target.value)
                      }
                      placeholder="Enter your full shipping address"
                      required
                    />
                  </label>

                  <p>Payment: Cash on Delivery</p>
                  <button type="submit">Place order</button>
                </form>
              </>
            )}
          </section>
        )}

        {showOrders && user && (
          <section className="products-section">
            <h2>My Orders</h2>

            {orders.length === 0 ? (
              <p>No orders found yet.</p>
            ) : (
              orders.map((order) => (
                <article className="product-card" key={order._id}>
                  <div className="product-info">
                    <h3>Order #{order._id}</h3>
                    <p>Status: {order.status}</p>
                    <p>
                      Total: ₹
                      {Number(order.totalAmount).toLocaleString("en-IN")}
                    </p>
                    <p>
                      Payment: {order.paymentMethod || "Cash on Delivery"}
                    </p>
                    <p>Address: {order.shippingAddress}</p>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">YOUR EVERYDAY ESSENTIALS</p>
            <h1>Find your next favorite thing.</h1>
            <p>
              Discover useful products, great value, and a simpler way to shop.
            </p>
            <a className="primary-button" href="#products">
              Explore products →
            </a>
          </div>

          <div className="hero-art" aria-hidden="true">
            <span className="hero-circle">S</span>
            <span className="hero-spark">✦</span>
            <span className="hero-caption">GOOD FINDS. GREAT DAYS.</span>
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE COLLECTION</p>
              <h2>
                {selectedCategory === "All"
                  ? "Featured products"
                  : selectedCategory}
              </h2>
            </div>

            <span>{filteredProducts.length} products</span>
          </div>

          <input
            className="product-search"
            type="search"
            placeholder="Search products..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            aria-label="Search products"
          />

          {visibleSubcategories.length > 0 && (
            <div className="subcategory-navigation">
              {visibleSubcategories.map((subcategory) => (
                <button
                  key={subcategory}
                  className={
                    selectedSubcategory === subcategory ? "active" : ""
                  }
                  onClick={() => setSelectedSubcategory(subcategory)}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          )}

          {loading && <p className="message">Loading products...</p>}
          {error && <p className="message error">{error}</p>}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="message">
              No matching products found. Try another category or search.
            </p>
          )}

          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product._id}>
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <span>✦</span>
                  )}

                  <span className="category-tag">
                    {product.subcategory || product.category || "Featured"}
                  </span>
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>

                  <p className="description">
                    {product.description ||
                      "A great addition to your everyday."}
                  </p>

                  <div className="product-bottom">
                    <strong>
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </strong>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock < 1}
                    >
                      {product.stock < 1 ? "Out of stock" : "Add to cart +"}
                    </button>
                  </div>

                  <small>
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : "Currently unavailable"}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <p className="eyebrow">SHOP WITH EASE</p>
          <h2>Simple shopping, all in one place.</h2>
          <p>Browse products and discover your everyday essentials.</p>
        </section>
      </main>

      <footer>
        <a className="brand" href="/">
          ShopNexis<span>.</span>
        </a>
        <p>Built with React and Express · SkillNexis Capstone</p>
      </footer>
    </div>
  );
}

export default App;
