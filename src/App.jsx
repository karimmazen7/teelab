import { Route, Routes } from "react-router";

import StoreLayout from "./layouts/StoreLayout";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Customizer from "./pages/Customizer";
import Faq from "./pages/Faq";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import OrderSuccess from "./pages/OrderSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import ReturnsExchanges from "./pages/ReturnsExchanges";

import AdminLayout from "./components/admin/AdminLayout";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import ScrollToTop from "./components/ScrollToTop";

import AdminContact from "./pages/admin/AdminContact";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDesigns from "./pages/admin/AdminDesigns";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/*
          Checkout uses its own dedicated navbar.
          It is outside StoreLayout to prevent the global navbar,
          announcement bar, and footer from appearing.
        */}
        <Route path="/checkout" element={<Checkout />} />

        {/* Public store pages */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/products" element={<Products />} />

          <Route path="/products/:productId" element={<ProductDetails />} />

          <Route path="/customizer" element={<Customizer />} />

          <Route path="/cart" element={<Cart />} />

          <Route path="/faqs" element={<Faq />} />

          <Route path="/contact" element={<Contact />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route path="/returns-exchanges" element={<ReturnsExchanges />} />

          <Route
            path="/order-success/:orderNumber"
            element={<OrderSuccess />}
          />

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

            <Route path="/admin/contact" element={<AdminContact />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
