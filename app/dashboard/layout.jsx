import AppHeader from "@/components/dashboard/AppHeader";
import AppNav from "@/components/dashboard/AppNav";
import Container from "@/components/dashboard/Container";
import React from "react";

export async function Layout({ children }) {
  return (
    <>
      <AppHeader />
      <main id="content" role="main">
        <AppNav />

        <Container>{children}</Container>
      </main>
    </>
  );
}

export default Layout;
