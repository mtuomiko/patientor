import React from "react";
import axios from "axios";
import { Icon } from 'semantic-ui-react';

import { Patient, Gender } from "../types";
import { apiBaseUrl } from "../constants";
import { useStateValue } from "../state";
import { useParams } from "react-router-dom";

const PatientDetailsPage: React.FC = () => {
  const [{ patients }, dispatch] = useStateValue();
  const { id } = useParams<{ id: string }>();

  const patient = patients[id];

  const GenderIcon: React.FC<{ gender: Gender }> = ({ gender }) => (
    <>
      {
        (gender === "male" && <Icon name="mars" />) ||
        (gender === "female" && <Icon name="venus" />) ||
        (gender === "other" && <Icon name="other gender" />) ||
        null
      }
    </>
  );

  React.useEffect(() => {
    if (!patient || !Object.prototype.hasOwnProperty.call(patient, 'ssn')) {
      (async () => {
        try {
          const { data: patientDetails } = await axios.get<Patient>(
            `${apiBaseUrl}/patients/${id}`
          );
          dispatch({ type: "ADD_PATIENT", payload: patientDetails });
        } catch (e) {
          console.error(e);
        }
      })();
    }
  });

  if (!patient) {
    return null;
  }
  return (
    <div>
      <h1>{patient.name} <GenderIcon gender={patient.gender} /></h1>
      <p>ssn: {patient?.ssn}</p>
      <p>occupation: {patient.occupation}</p>
      {patient.dateOfBirth && <p>date of birth: {patient.dateOfBirth}</p>}
    </div>
  );
};

export default PatientDetailsPage;