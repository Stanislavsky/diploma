import React, { useState } from 'react';
import QuestionCard from '../../../components/QuetionCard/QuetionCard'
import Chat from '../../../components/Chat/Chat'; 
import { AnimatedDiv, cardAnimation, chatAnimation } from '../../../components/Animations/Animations';
import { FaBell } from 'react-icons/fa';
import styles from '../AdminPanel.module.css';

export default function AdminHome() {
  const [openChats, setOpenChats] = useState({});
  const [searchDoctor, setSearchDoctor] = useState('');
  const [searchClinic, setSearchClinic] = useState('');
  const [notifications] = useState([]);

  const now = new Date();
  const formattedDate = now.toLocaleDateString('ru-RU');
  const formattedTime = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const createdAt = `${formattedDate} ${formattedTime}`;

  const handleReplyClick = (id) => {
    setOpenChats(prev => ({
      ...prev,
      [id]: { isOpen: true, openedAt: `${formattedDate} ${formattedTime}`, userId: id },
    }));
  };

  const handleCloseChat = (id) => {
    setOpenChats(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  };

  const handleRedirect = (userId) => {
    console.log(`Перенаправить вопрос пользователю с ID: ${userId}`);
  };

  const questionCards = [
    {
      id: 1,
      doctorName: "Иванов Иван Иванович",
      clinicName: "Поликлиника №5",
      questionText: "Как продлить справку о прививках?привет как дела у меня все хоршо а у вас как?зыолвыоваолвдаоывдаоыдлаоыдаоыдлваоыдлвоалы ооооооо",
      attachmentUrl: "https://example.com/uploads/photo.jpg"
    },
    {
      id: 2,
      doctorName: "Виктор Викторович",
      clinicName: "Поликлиника №10",
      questionText: "Как записаться на прием?",
      attachmentUrl: "https://example.com/uploads/photo2.jpg"
    },
    {
      id: 3,
      doctorName: "Петрова Мария Сергеевна",
      clinicName: "Городская больница №3",
      questionText: "Какие документы нужны для оформления инвалидности?",
      attachmentUrl: null
    },
    {
      id: 4,
      doctorName: "Сидоров Петр Петрович",
      clinicName: "Детская поликлиника №2",
      questionText: "Как получить направление на МРТ?",
      attachmentUrl: "https://example.com/uploads/document.pdf"
    }
  ];

  const filteredCards = questionCards.filter(card => {
    const doctorMatch = card.doctorName.toLowerCase().includes(searchDoctor.toLowerCase());
    const clinicMatch = card.clinicName.toLowerCase().includes(searchClinic.toLowerCase());
    return doctorMatch && clinicMatch;
  });

  const activeChat = Object.entries(openChats).find(([_, chat]) => chat.isOpen);

  return (
    <div className={styles.adminPanel}>
      <div className={styles.searchPanel}>
        <h2 className={styles.searchTitle}>Поиск</h2>
        <div>
          <label className={styles.searchLabel}>Поиск по ФИО врача</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Введите ФИО врача"
            value={searchDoctor}
            onChange={(e) => setSearchDoctor(e.target.value)}
          />
        </div>
        <div>
          <label className={styles.searchLabel}>Поиск по клинике</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Введите название клиники"
            value={searchClinic}
            onChange={(e) => setSearchClinic(e.target.value)}
          />
        </div>
        <div className={styles.notificationsPanel}>
          <div className={styles.notificationsContent}>
            <FaBell className={styles.bellIcon} />
            <p className={styles.notificationsText}>У вас пока 0 уведомлений</p>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {filteredCards.map(card => (
          <div key={card.id}>
            <AnimatedDiv animation={cardAnimation}>
              <QuestionCard 
                doctorName={card.doctorName}
                clinicName={card.clinicName}
                question={card.questionText}
                datetime={createdAt}
                attachmentUrl={card.attachmentUrl}
                onReply={() => handleReplyClick(card.id)}
              />
            </AnimatedDiv>
          </div>
        ))}
      </div>
      {activeChat && (
        <div className={styles.overlay}>
          <div className={styles.chatModal}>
            <AnimatedDiv animation={chatAnimation}>
              <Chat 
                doctorName={questionCards.find(card => card.id === parseInt(activeChat[0]))?.doctorName}
                openedAt={activeChat[1].openedAt}
                userId={activeChat[1].userId}
                onClose={() => handleCloseChat(activeChat[0])}
                onRedirect={handleRedirect}
              />
            </AnimatedDiv>
          </div>
        </div>
      )}
    </div>
  );
}