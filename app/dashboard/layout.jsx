import AppNav from "@/components/dashboard/AppNav";
import Container from "@/components/dashboard/Container";
import React from "react";

export const metadata = {
  title: { absolute: "Dashboard" },
  robots: {
    index: false,
    follow: false,
  },
};

export async function Layout({ children }) {
  return (
    <>
      <main id="content" role="main" className="min-h-screen">
        <AppNav />

        <Container>{children}</Container>
      </main>
    </>
  );
}

export default Layout;
