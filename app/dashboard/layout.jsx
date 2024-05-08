import AppNav from "@/components/dashboard/AppNav";
import Container from "@/components/dashboard/Container";
import Script from "next/script";
import React from "react";

export const metadata = {
  title: { absolute: "Dashboard" },
  robots: {
    index: false,
    follow: false,
  },
};

async function DashboardLayout({ children }) {
  return (
    <>
      <main id="content" role="main" className="min-h-screen">
        <AppNav />

        <Container>{children}</Container>
      </main>
    </>
  );
}

export default DashboardLayout;
