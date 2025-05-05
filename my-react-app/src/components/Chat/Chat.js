// src/components/Chat/Chat.jsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css'; // Подключаем стили


export default function Chat({ doctorName, openedAt, userId, onClose, onRedirect }) {
  const [messages, setMessages] = useState([]); // Состояние для хранения сообщений
  const [message, setMessage] = useState(''); // Состояние для текущего сообщения
  const [isTaskSolved, setIsTaskSolved] = useState(false); // Состояние для отслеживания решения задачи
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('doctor'); // Состояние для активной вкладки
  const [showAdminTab, setShowAdminTab] = useState(false); // Состояние для отображения вкладки сопровождающего
  const [selectedImage, setSelectedImage] = useState(null); // Состояние для выбранного изображения
  const [isRedirected, setIsRedirected] = useState(false); // Состояние для отслеживания перенаправления
  const fileInputRef = useRef(null); // Ссылка на скрытый input для загрузки файлов
  const messagesEndRef = useRef(null); // Ссылка на конец списка сообщений

  // Загружаем состояние перенаправления из localStorage при монтировании компонента
  useEffect(() => {
    const savedRedirected = localStorage.getItem(`chat_redirected_${userId}`);
    if (savedRedirected === 'true') {
      setIsRedirected(true);
      setShowAdminTab(true);
      setActiveTab('admin');
    }
  }, [userId]);

  // Функция для прокрутки вниз
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Прокручиваем вниз при изменении сообщений
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() !== '' || selectedImage) {
      const newMessage = {
        text: message,
        sender: 'admin',
        image: selectedImage
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      setSelectedImage(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleTaskSolved = () => {
    setIsTaskSolved(true);
    setTimeout(handleClose, 1000);
  };

  const handleRedirect = () => {
    setIsRedirected(true);
    setShowAdminTab(true);
    setActiveTab('admin');
    // Сохраняем состояние перенаправления в localStorage
    localStorage.setItem(`chat_redirected_${userId}`, 'true');
    if (onRedirect) {
      onRedirect(userId);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleImageDoubleClick = (imageUrl) => {
    // Создаем временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'image.png'; // Имя файла при скачивании
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`${styles.chatContainer} ${isClosing ? styles.closing : ''}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3>Чат с врачом: {doctorName}</h3>
          {isTaskSolved && <span className={styles.solvedBadge}>Задача решена</span>}
          {isRedirected && <span className={styles.redirectedBadge}>Перенаправлен</span>}
        </div>
        <div className={styles.headerRight}>
          {!isTaskSolved && (
            <button onClick={handleTaskSolved} className={styles.solveButton}>
              Задача решена
            </button>
          )}
          <button onClick={handleClose} className={styles.closeButton}>Закрыть</button>
        </div>
      </div>
      <div className={styles.container}>
        <span 
          className={`${styles.chatTab} ${activeTab === 'doctor' ? styles.active : ''}`}
          onClick={() => setActiveTab('doctor')}
        >
          врач 
        </span>
        {showAdminTab && (
          <span 
            className={`${styles.chatTab} ${activeTab === 'admin' ? styles.active : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            сопровождающий 
          </span>
        )}
      </div>
      
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.emptyChatMessage}>
            <p>Чат пустой. Начните диалог</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'admin' ? styles.adminMessage : styles.doctorMessage}>
              {msg.image && (
                <div 
                  className={styles.messageImageContainer}
                  onDoubleClick={() => handleImageDoubleClick(msg.image)}
                >
                  <img src={msg.image} alt="Отправленное изображение" className={styles.messageImage} />
                  <div className={styles.imageHint}>Дважды кликните для скачивания</div>
                </div>
              )}
              {msg.text && <p>{msg.text}</p>}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        {selectedImage && (
          <div 
            className={styles.selectedImageContainer}
            onDoubleClick={() => handleImageDoubleClick(selectedImage)}
          >
            <img src={selectedImage} alt="Выбранное изображение" className={styles.selectedImage} />
            <div className={styles.imageHint}>Дважды кликните для скачивания</div>
            <button onClick={removeSelectedImage} className={styles.removeImageButton}>
              ×
            </button>
          </div>
        )}
        <button 
          onClick={() => fileInputRef.current.click()} 
          className={styles.uploadButton}
          title="Прикрепить изображение"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13V19H5V13H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V13H19Z" fill="currentColor"/>
            <path d="M12 3L8 7H11V15H13V7H16L12 3Z" fill="currentColor"/>
          </svg>
        </button>
        <div className={styles.inputRow}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            className={styles.textarea}
          />
          <button 
            onClick={handleSendMessage} 
            className={styles.sendButton}
            disabled={!message.trim() && !selectedImage}
          >
            Отправить
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {onRedirect && !isRedirected && (
        <div className={styles.chatDetails}>
          <p>Чат открыт: {openedAt}</p>
          <button 
            onClick={handleRedirect} 
            className={styles.redirectButton}
          >
            Перенаправить вопрос
          </button>
        </div>
      )}
    </div>
  );
}