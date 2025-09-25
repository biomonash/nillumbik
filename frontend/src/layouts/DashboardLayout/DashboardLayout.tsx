import React from 'react'
import { Outlet } from 'react-router'
import Sidebar from '../../components/ui/Sidebar'
import Header from '../../components/ui/Header'
import Footer from '../../components/ui/Footer'
import styles from './DashboardLayout.module.scss'

const DashboardLayout: React.FC = () => {
  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.layoutBody}>
        <div className={styles.sidebar}>
          <Sidebar />
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default DashboardLayout;