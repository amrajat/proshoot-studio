import AppHeader from "@/components/dashboard/AppHeader";
import AppNav from "@/components/dashboard/AppNav";

async function Layout({ children }) {
  return (
    <>
      <AppHeader />
      <main id="content" role="main">
        <AppNav />

        {children}
      </main>
    </>
  );
}

export default Layout;
