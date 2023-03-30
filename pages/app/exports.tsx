import { Button } from '@mantine/core';
import React, { useState } from 'react';
import { tw } from 'twind';
import AppLayout from '../../components/Layout';
import { Patient } from '../../types/Patient';
import { getAllPatients } from './patients-list';
import { Event } from '../../types/Event';

export default function ExportsPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);

  // Patient events are stored as JSON inside the metadata field,
  // since the structure is unknown at present, this method needs careful consideration.
  const [patientEvents, setPatientEvents] = useState<Event[]>([])

  const startDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const token = localStorage.getItem('token') || "";
    getAllPatients(token)
      .then((patients) => {
        setPatientsList(patients);
        setIsDownloading(false);
        if (patients.length === 0) {
          alert('No patients found');
          return;
        };
        exportTableToExcel('patientsList', `patients-${new Date().toISOString()}`);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <AppLayout title="Exports">
      <Button loading={isDownloading} onClick={startDownload} size="lg">
        Export All Patient Data
      </Button>

      <table id="patientsList" className={tw('table-auto invisible')}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Given Name</th>
            <th>Surname</th>
            <th>Date of Birth</th>
            <th>Country</th>
            <th>Hometown</th>
            <th>Sex</th>
            <th>Phone</th>
            <th>Camp</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>

        <tbody>
          {patientsList.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.id}</td>
              <td>{patient.given_name}</td>
              <td>{patient.surname}</td>
              <td>{patient.date_of_birth}</td>
              <td>{patient.country}</td>
              <td>{patient.hometown}</td>
              <td>{patient.sex}</td>
              <td>{patient.phone}</td>
              <td>{patient.camp}</td>
              <td>{patient.created_at}</td>
              <td>{patient.updated_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppLayout>
  );
}

function exportTableToExcel(tableID: string, filename = '') {
  var downloadLink;
  var dataType = 'application/vnd.ms-excel';
  var tableSelect = document.getElementById(tableID);
  var tableHTML = tableSelect?.outerHTML.replace(/ /g, '%20');

  // Specify file name
  filename = filename ? filename + '.xls' : 'excel_data.xls';

  // Create download link element
  downloadLink = document.createElement('a');

  document.body.appendChild(downloadLink);

  // @ts-ignore
  if (navigator.msSaveOrOpenBlob) {
    // @ts-ignore
    var blob = new Blob(['\ufeff', tableHTML], {
      type: dataType,
    });
    // @ts-ignore
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    // Create a link to the file
    downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

    // Setting the file name
    downloadLink.download = filename;

    //triggering the function
    downloadLink.click();
  }
}
