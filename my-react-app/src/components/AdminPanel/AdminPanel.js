import React, { useState } from 'react';
import styles from './AdminPanel.module.css';
import { FaBell } from 'react-icons/fa';

export default function AdminPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([]); 

  return (
    <div className={styles.adminPanel}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.notificationsPanel}>
        <div className={styles.notificationsContent}>
          <FaBell className={styles.bellIcon} />
          <p className={styles.notificationsText}>У вас пока 0 уведомлений</p>
        </div>
      </div>
    </div>
  );
} 