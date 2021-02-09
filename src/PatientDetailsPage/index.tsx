import React from "react";
import axios from "axios";
import { Message, Icon, Button } from 'semantic-ui-react';

import { Patient, Gender, Entry, HospitalEntry, Diagnosis, OccupationalHealthcareEntry, HealthCheckEntry } from "../types";
import { apiBaseUrl } from "../constants";
import { useStateValue, addPatient } from "../state";
import { useParams } from "react-router-dom";
import AddEntryModal from "../AddEntryModal";
import { EntryFormValues } from "../AddEntryModal/AddEntryForm";
import HealthRatingBar from "../components/HealthRatingBar";

const PatientDetailsPage: React.FC = () => {
  const [{ patients, diagnoses }, dispatch] = useStateValue();
  const { id } = useParams<{ id: string }>();

  const patient = patients[id];

  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();

  const openModal = (): void => setModalOpen(true);

  const closeModal = (): void => {
    setModalOpen(false);
    setError(undefined);
  };

  const submitNewEntry = async (values: EntryFormValues) => {
    // If type OccupationalHealthcare remove extra properties before sending
    const { ...finalValues } = values;
    if (finalValues.type === "OccupationalHealthcare") {
      if (!finalValues.includeSickLeave) {
        delete finalValues.sickLeave;
      }
      delete finalValues.includeSickLeave;
    }

    console.log('sending values...');
    console.log(finalValues);
    try {
      const { data: newEntry } = await axios.post<Entry>(
        `${apiBaseUrl}/patients/${patient.id}/entries`,
        finalValues
      );
      const modifiedPatient = {
        ...patient,
        entries: [
          ...patient.entries,
          newEntry,
        ],
      };
      dispatch(addPatient(modifiedPatient));
      closeModal();
    } catch (e) {
      console.error(e.response.data);
      setError(e.response.data);
    }
  };

  React.useEffect(() => {
    if (!patient || !Object.prototype.hasOwnProperty.call(patient, 'ssn')) {
      (async () => {
        try {
          const { data: patientDetails } = await axios.get<Patient>(
            `${apiBaseUrl}/patients/${id}`
          );
          dispatch(addPatient(patientDetails));
        } catch (e) {
          console.error(e);
        }
      })();
    }
  });

  const GenderIcon: React.FC<{ gender: Gender }> = ({ gender }) => {
    switch (gender) {
      case "male":
        return <Icon name="mars" />;
      case "female":
        return <Icon name="venus" />;
      case "other":
        return <Icon name="other gender" />;
      default:
        return null;
    }
  };

  const Entries: React.FC<{ entries: Entry[] }> = ({ entries }) => {
    if (!entries) {
      return null;
    }
    return (
      <div>
        <h2>Entries</h2>
        {patient.entries.map(e => (
          <EntryDetails key={e.id} entry={e} />
        ))}
      </div>
    );
  };

  const EntryDiagnoses: React.FC<{ diagnosisCodes: Array<Diagnosis['code']> }> = ({ diagnosisCodes }) => (
    <Message.List>
      {diagnosisCodes.map(dc => (
        <Message.Item key={dc}>{dc} {diagnoses[dc]?.name}</Message.Item>
      ))}
    </Message.List>
  );

  const assertNever = (value: never): never => {
    throw new Error(`Unhandled entry: ${JSON.stringify(value)}`);
  };

  const EntryDetails: React.FC<{ entry: Entry }> = ({ entry }) => {
    switch (entry.type) {
      case "Hospital":
        return <HospitalEntryComponent entry={entry} />;
      case "OccupationalHealthcare":
        return <OccupationalHealthcareEntryComponent entry={entry} />;
      case "HealthCheck":
        return <HealthCheckEntryComponent entry={entry} />;
      default:
        return assertNever(entry);
    }
  };

  const HospitalEntryComponent: React.FC<{ entry: HospitalEntry }> = ({ entry }) => (
    <Message>
      <Message.Content>
        <Message.Header><Icon name="hospital symbol" /> {entry.date}</Message.Header>
        <p>{entry.description}</p>
        <p>Discharged on {entry.discharge.date}: {entry.discharge.criteria}</p>
      </Message.Content>
      {entry.diagnosisCodes && <EntryDiagnoses diagnosisCodes={entry.diagnosisCodes} />}
    </Message>
  );

  const OccupationalHealthcareEntryComponent: React.FC<{ entry: OccupationalHealthcareEntry }> = ({ entry }) => (
    <Message>
      <Message.Content>
        <Message.Header><Icon name="stethoscope" /> {entry.date} {entry.employerName}</Message.Header>
        <p>{entry.description}</p>
        {entry.sickLeave &&
          <>
            <p>Sick leave start: {entry.sickLeave.startDate}</p>
            <p>Sick leave end: {entry.sickLeave.endDate}</p>
          </>
        }
      </Message.Content>
      {entry.diagnosisCodes && <EntryDiagnoses diagnosisCodes={entry.diagnosisCodes} />}
    </Message>
  );

  const HealthCheckEntryComponent: React.FC<{ entry: HealthCheckEntry }> = ({ entry }) => (
    <Message>
      <Message.Content>
        <Message.Header><Icon name="doctor" /> {entry.date}</Message.Header>
        <p>{entry.description}</p>
        <HealthRatingBar showText={true} rating={entry.healthCheckRating} />
      </Message.Content>
      {entry.diagnosisCodes && <EntryDiagnoses diagnosisCodes={entry.diagnosisCodes} />}
    </Message>
  );

  if (!patient) {
    return null;
  }
  return (
    <div>
      <h1>{patient.name} <GenderIcon gender={patient.gender} /></h1>
      <p>SSN: {patient?.ssn}</p>
      <p>Occupation: {patient.occupation}</p>
      {patient.dateOfBirth && <p>Date of birth: {patient.dateOfBirth}</p>}

      <Entries entries={patient.entries} />
      <AddEntryModal
        modalOpen={modalOpen}
        onSubmit={submitNewEntry}
        error={error}
        onClose={closeModal}
      />
      <Button onClick={() => openModal()}>Add New Entry</Button>
    </div>
  );
};

export default PatientDetailsPage;