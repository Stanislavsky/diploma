import React, { useState } from 'react';
import styles from './HelpModal.module.css';
import { FaTimes, FaPaperclip } from 'react-icons/fa';

const HelpModal = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь будет логика отправки сообщения и файла
    console.log('Отправка сообщения:', message);
    console.log('Отправка файла:', file);
    
    // Очистка формы после отправки
    setMessage('');
    setFile(null);
    setFileName('');
    
    // Закрытие модального окна
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Центр помощи</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>
                Опишите вашу проблему
              </label>
              <textarea
                id="message"
                className={styles.textarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Пожалуйста, подробно опишите проблему, с которой вы столкнулись..."
                required
              />
            </div>
            
            <div className={styles.fileUpload}>
              <label htmlFor="file" className={styles.fileLabel}>
                <FaPaperclip className={styles.fileIcon} />
                Прикрепить файл
              </label>
              <input
                type="file"
                id="file"
                className={styles.fileInput}
                onChange={handleFileChange}
              />
              {fileName && (
                <div className={styles.fileName}>
                  Выбран файл: {fileName}
                </div>
              )}
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                Отправить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HelpModal; 