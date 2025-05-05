import React from 'react';
import './ListOfPatients.css';

const ListOfPatients = () => {
  // Пример данных пациентов
  const patients = [
    {
      id: 1,
      name: 'Иванов Иван Иванович',
      age: 45,
      diagnosis: 'Гипертония',
      status: 'active',
      lastVisit: '2024-04-15'
    },
    {
      id: 2,
      name: 'Петрова Мария Сергеевна',
      age: 32,
      diagnosis: 'Диабет',
      status: 'active',
      lastVisit: '2024-04-10'
    },
   
  ];

  const handleEdit = (id) => {
    console.log('Редактировать пациента:', id);
  };

  const handleDelete = (id) => {
    console.log('Удалить пациента:', id);
  };

  return (
    <div className="patients-list">
      <div className="patients-header">
        <h2 className="patients-title">Список пациентов</h2>
        <button className="button button-primary">Добавить пациента</button>
      </div>
      
      <table className="patients-table">
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Возраст</th>
            <th>Диагноз</th>
            <th>Статус</th>
            <th>Последний визит</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.name}</td>
              <td>{patient.age}</td>
              <td>{patient.diagnosis}</td>
              <td>
                <span className={`patient-status status-${patient.status}`}>
                  {patient.status === 'active' ? 'Активен' : 'Неактивен'}
                </span>
              </td>
              <td>{patient.lastVisit}</td>
              <td>
                <div className="patient-actions">
                  <button 
                    className="action-button edit-button"
                    onClick={() => handleEdit(patient.id)}
                  >
                    Редактировать
                  </button>
                  <button 
                    className="action-button delete-button"
                    onClick={() => handleDelete(patient.id)}
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListOfPatients;