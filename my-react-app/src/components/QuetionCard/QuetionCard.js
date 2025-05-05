import React from 'react';
import styles from './QuetionCard.module.css';
import { FaFileAlt, FaRegFileAlt } from 'react-icons/fa';

const QuestionCard = ({ doctorName, clinicName, question, attachmentUrl, datetime, onReply }) => {
  return (
    <div className={styles.card}>
      <div className={styles.card_item}>
        <div className={styles.header}>
          <h3>{doctorName}</h3>
          <p>{clinicName}</p>
        </div>
        <div className={styles.body}>
          <p>{question}</p>
          <div className={styles.attachment}>
            {attachmentUrl ? (
              <>
                <img src={attachmentUrl} alt="Attachment" className={styles.image} />
                <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  Открыть файл
                </a>
              </>
            ) : (
              <div className={styles.noAttachment}>
                <FaRegFileAlt className={styles.noAttachmentIcon} />
                <span className={styles.noAttachmentText}>Файл не прикреплен</span>
              </div>
            )}
          </div>
        </div>
        <div className={styles.footer}>
          <span className={styles.datetime}>{datetime}</span>
          <button className={styles.button} onClick={onReply}>
            Ответить
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;