import { Text, Button, Paper, SimpleGrid, Select, Table } from '@mantine/core';
import React, { useEffect, useMemo, useState } from 'react';
import { tw } from 'twind';
import { format, isValid } from "date-fns"
import AppLayout from '../../components/Layout';
import { Patient } from '../../types/Patient';
import { getAllPatients } from './patients-list';
import { Event } from '../../types/Event';
import { getAllForms } from './forms-list';
import { HHForm } from '../../types/Inputs';
import { DatePickerInput } from '@mantine/dates';
import { useImmer } from 'use-immer';
import If from '../../components/If';
const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;


type InputType = "number" | 'checkbox' | 'radio' | 'select' | "diagnosis" | "medicine"
type EventResponse = {
  eventType: string;
  formId: string;
  patientName: string;
  formData: { fieldId: string, fieldType: string, inputType: InputType, name: string, value: string | number }[]
}

export default function ExportsPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [forms, setForms] = useState<(HHForm & { created_at: string })[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [eventResponse, setEventResponse] = useState<EventResponse[]>([])
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [filters, updateFilters] = useImmer<{ id: string, dateRange: [Date | null, Date | null] }>({
    id: "",
    dateRange: [null, null]
  })

  // Patient events are stored as JSON inside the metadata field,
  // since the structure is unknown at present, this method needs careful consideration.
  const [patientEvents, setPatientEvents] = useState<Event[]>([])


  /** Given a form Id, return the form name from the list of forms loaded
  @param {string} formId
  @param {HHForm[]} forms
  @returns {string} name
  */
  const getFormName = (formId: string, forms: HHForm[]): string => {
    return forms.find(f => f.id === formId)?.name || ""
  }

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


  // on page load, get all the forms from the database
  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoadingEvents(true)
    getAllForms(token || "").then(res => {
      // @ts-ignore ts error
      setForms(res)
    }).catch(error => {
      alert("Unable to fetch forms. Please check your network connectivity.");
      console.error(error);
    }).finally(() => {
      setLoadingEvents(false)
    })
  }, []);

  const handleSearch = async () => {
    if (loadingEvents) return;
    try {
      const token = localStorage.getItem('token') || "";
      const { id, dateRange } = filters;
      let params = `id=${id}&start_date=${format(dateRange[0] || new Date(), "yyyy-MM-dd")}&end_date=${format(dateRange[1] || new Date(), "yyyy-MM-dd")}`;
      setLoadingEvents(true);

      const response = await fetch(`${HIKMA_API}/admin_api/get_event_form_data?${params}`, {
        method: "GET",
        headers: {
          Authorization: token
        }
      })

      const events = (await response.json()).events;

      const evResponse = events as EventResponse[]
      console.log({ evResponse })
      setEventResponse(evResponse || [])

    } catch (error) {
      alert("An error occured searching for these events. Please try again.");
    } finally {
      setLoadingEvents(false)
    }

    // console.log(events)
  }

  const eventColumns = useMemo(() => {
    const cols = new Set();
    eventResponse.map(ev => {
      ev.formData.forEach(ex => cols.add(ex.name));
    })
    return Array.from(cols) as string[];
  }, [eventResponse])


  /** Given a list of form event entries, and an event name, return the string value or an empty string */
  const getFormDataItem = (formData: any[], name: string) => {
    const entry = formData.find(fD => fD.name === name)
    if (entry) {
      return entry.value || ""
    }
    return ""
  }


  /** Download all the events from this specific selected form and within this date range */
  const downloadEvents = () => {
    const { dateRange, id } = filters;
    const startDate = isValid(dateRange[0]) ? format(dateRange[0] as any, "yyyy MM dd") : "__";
    const endDate = isValid(dateRange[1]) ? format(dateRange[1] as any, "yyyy MM dd") : "__";
    const eventName = getFormName(id, forms || []);
    const fileName = `${startDate}-${endDate}-${eventName}`;

    tableToCSV(fileName);
  }


  return (
    <AppLayout title="Exports">

      <SimpleGrid cols={4}
        spacing="lg"
        breakpoints={[
          { maxWidth: '62rem', cols: 3, spacing: 'md' },
          { maxWidth: '48rem', cols: 2, spacing: 'sm' },
          { maxWidth: '36rem', cols: 1, spacing: 'sm' },
        ]}>
        {forms.map(form =>
          <Paper shadow="xs" key={form.id} p="md">
            <Text>{form.name}</Text>
          </Paper>
        )}
      </SimpleGrid>


      <SimpleGrid cols={3} mb={20}>
        <Select
          label="Choose the form to render"
          placeholder="Pick one"
          onChange={(e) => updateFilters(draft => {
            // @ts-ignore
            draft.id = e
          })}
          data={forms.map(form => ({ label: form.name, value: form.id }))}
        />

        <DatePickerInput
          type="range"
          label="Pick dates range"
          placeholder="Pick dates range"
          value={filters.dateRange as [Date, Date]}
          onChange={(range) => {
            updateFilters(draft => {
              // @ts-ignore
              draft.dateRange = range
            })
          }}
        />


        <div style={{ display: "flex", alignContent: "flex-end", alignSelf: "flex-end" }}>
          <Button onClick={handleSearch} disabled={loadingEvents}>{loadingEvents ? "Loading ..." : "Search"}</Button>
        </div>
      </SimpleGrid>


      {/*<Button loading={isDownloading} onClick={startDownload} size="lg">
        Export All Patient Data
      </Button>*/}


      <If show={eventResponse.length > 0}>


        <Button onClick={downloadEvents} variant={"light"}>
          Download Events
        </Button>


        <Table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Patient Name</th>
              {
                eventColumns.map(ev => <th key={ev}>{ev}</th>)
              }
            </tr>
          </thead>
          <tbody>{
            eventResponse.map((ev, idx) => {
              return (
                <tr key={idx}>
                  {/*@ts-ignore */}
                  <td>{format(ev.createdAt, "yyyy/MM/dd")}</td>
                  <td>{ev.patientName}</td>
                  {eventColumns.map((evC, idx) => (
                    <td key={idx}>{getFormDataItem(ev.formData, evC)}</td>
                  ))}
                </tr>
              )
            })
          }</tbody>
        </Table>
      </If>

      {/**
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
*/}
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


/** 
REF: https://www.geeksforgeeks.org/how-to-export-html-table-to-csv-using-javascript/ 

@param {string} fileName of the file you wish to save as
*/

export function tableToCSV(fileName: string) {

  // Variable to store the final csv data
  let csv_data = [];

  // Get each row data
  let rows = document.getElementsByTagName('tr');
  for (let i = 0; i < rows.length; i++) {

    // Get each column data
    let cols = rows[i].querySelectorAll('td,th');

    // Stores each csv row data
    let csvrow = [];
    for (let j = 0; j < cols.length; j++) {

      // Get the text data of each cell
      // of a row and push it to csvrow
      csvrow.push(cols[j].innerHTML);
    }

    // Combine each column value with comma
    csv_data.push(csvrow.join("\t"));
  }

  // Combine each row data with new line character
  let csv_data_str = csv_data.join('\n');

  // Call this function to download csv file  
  downloadCSVFile(fileName, csv_data_str);

}

function downloadCSVFile(fileName: string, csv_data: any) {

  // Create CSV file object and feed
  // our csv_data into it
  let CSVFile = new Blob([csv_data], {
    type: "text/tsv"
  });

  // Create to temporary link to initiate
  // download process
  let temp_link = document.createElement('a');

  // Download csv file
  temp_link.download = fileName + ".tsv";
  let url = window.URL.createObjectURL(CSVFile);
  temp_link.href = url;

  // This link should not be displayed
  temp_link.style.display = "none";
  document.body.appendChild(temp_link);

  // Automatically click the link to
  // trigger download
  temp_link.click();
  document.body.removeChild(temp_link);
}
