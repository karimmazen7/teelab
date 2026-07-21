import { Route, Routes } from "react-router";

import StoreLayout from "./layouts/StoreLayout";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Customizer from "./pages/Customizer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import OrderSuccess from "./pages/OrderSuccess";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";

import AdminLayout from "./components/admin/AdminLayout";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDesigns from "./pages/admin/AdminDesigns";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
  return (
    <Routes>
      {/* Public store pages */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Products />} />

        <Route path="/products/:productId" element={<ProductDetails />} />

        <Route path="/customizer" element={<Customizer />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected admin pages */}
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/admin/orders" element={<AdminOrders />} />

          <Route
            path="/admin/orders/:orderId"
            element={<AdminOrderDetails />}
          />

          <Route path="/admin/customers" element={<AdminCustomers />} />

          <Route path="/admin/designs" element={<AdminDesigns />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
