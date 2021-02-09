import React from "react";
import { Grid, Button, Divider } from "semantic-ui-react";
import { Field, Formik, Form } from "formik";
import { BaseEntry, DistributiveOmit, HealthCheckEntry, HospitalEntry, OccupationalHealthcareEntry } from "../types";
import { useStateValue } from "../state";
import { DiagnosisSelection, NumberField, SemanticRadioTypeField, SemanticSickLeaveCheckboxField, TextField } from "../components/FormField";
import { dateValidator, healthCheckRatingValidator } from "../validators";

/* 
  I wanted the entry form to initialize in a state where no type is selected 
  so I added an initial state with base entry properties and undefined type. 
*/
type InitialFormState = BaseEntry & { type: undefined };

/* 
  Add an extra property for whether to include sick leave or not, this is not
  part of the actual object which will be sent but rather used to define the 
  inner state of the form.
*/
export type FormOccupationalHealthcareEntry =
  Omit<OccupationalHealthcareEntry & { includeSickLeave?: boolean }, "id">;

type FormEntry =
  HospitalEntry
  | FormOccupationalHealthcareEntry
  | HealthCheckEntry
  | InitialFormState;

// Remove id from the rest of the union types since the form has no need/access to it
export type EntryFormValues = DistributiveOmit<FormEntry, "id">;

/*
  Trial code
*/

// type BaseEntryNoIdWithType = Omit<BaseEntry, "id"> & { type: FormEntryTypes };
// export type EntryFormValues = EntryFormValuesNoId | BaseEntryNoIdWithType;

//type EntryFormValuesNoIdNoType = DistributiveOmit<EntryFormValuesNoId, "type">;
// type EntryTypesWithUndefined =
//   "Hospital"
//   | "OccupationalHealthcare"
//   | "HealthCheck"
//   | undefined;

// export type EntryFormValues = Omit<EntryFormValuesNoId, "type">
//   & { type: FormEntryTypes };

// export type EntryFormValues = DistributiveTypeOverride<EntryFormValuesNoId>;

interface Props {
  onSubmit: (values: EntryFormValues) => void;
  onCancel: () => void;
}

const AddEntryForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [{ diagnoses }] = useStateValue();

  const SpecificEntryFormFields: React.FC<{
    values: EntryFormValues;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValues: any;
  }> = ({ values, setValues }) => {
    switch (values.type) {
      case "Hospital":
        return (
          <>
            <Field
              label="Discharge date"
              placeholder="YYYY-MM-DD"
              name="discharge.date"
              component={TextField}
            />
            <Field
              label="Discharge criteria"
              placeholder="Discharge criteria"
              name="discharge.criteria"
              component={TextField}
            />
          </>
        );
      case "OccupationalHealthcare":
        return (
          <>
            <Field
              label="Employer name"
              placeholder="Employer name"
              name="employerName"
              component={TextField}
            />
            <SemanticSickLeaveCheckboxField
              values={values}
              setValues={setValues}
            />
            {values.includeSickLeave && (
              <>
                <Field
                  label="Sick leave start date"
                  placeholder="YYYY-MM-DD"
                  name="sickLeave.startDate"
                  component={TextField}
                />
                <Field
                  label="Sick leave end date"
                  placeholder="YYYY-MM-DD"
                  name="sickLeave.endDate"
                  component={TextField}
                />
              </>
            )}
          </>
        );
      case "HealthCheck":
        return (
          <Field
            label="Health check rating"
            name="healthCheckRating"
            component={NumberField}
            min={0}
            max={3}
          />
        );
      default:
        return null;
    }
  };

  // Yup schema validation would probably be a better choice 
  const validate = (values: EntryFormValues) => {
    const requiredError = "Field is required";
    const dateError = "Invalid date";
    const errors: { [field: string]: string | object } = {};
    if (!values.description) {
      errors.description = requiredError;
    }
    if (!dateValidator(values.date)) {
      errors.date = dateError;
    }
    if (!values.specialist) {
      errors.specialist = requiredError;
    }
    switch (values.type) {
      case "Hospital":
        if (!dateValidator(values.discharge.date)) {
          errors.discharge = typeof errors.discharge === "object"
            ? { ...errors.discharge, date: dateError }
            : { date: dateError };
        }
        if (!values.discharge.criteria) {
          errors.discharge = typeof errors.discharge === "object"
            ? { ...errors.discharge, criteria: requiredError }
            : { criteria: requiredError };
        }
        break;
      case "OccupationalHealthcare":
        if (!values.employerName) {
          errors.employerName = requiredError;
        }
        if (values.includeSickLeave) {
          if (!dateValidator(values?.sickLeave?.startDate)) {
            errors.sickLeave = typeof errors.sickLeave === "object"
              ? { ...errors.sickLeave, startDate: dateError }
              : { startDate: dateError };
          }
          if (!dateValidator(values?.sickLeave?.endDate)) {
            errors.sickLeave = typeof errors.sickLeave === "object"
              ? { ...errors.sickLeave, endDate: dateError }
              : { endDate: dateError };
          }
        }
        break;
      case "HealthCheck":
        if (!healthCheckRatingValidator(values.healthCheckRating)) {
          errors.healthCheckRating = "Not valid health check rating";
        }
        break;
    }

    return errors;
  };

  return (
    <Formik
      initialValues={{
        description: "",
        date: "",
        specialist: "",
        diagnosisCodes: [],
        type: undefined,
      }}
      onSubmit={onSubmit}
      validate={validate}
    >
      {({ isValid, dirty, setFieldValue, setFieldTouched, values, setValues }) => {
        return (
          <Form className="form ui">
            <p>Type: {values.type}</p>
            <Grid columns={3} divided>
              <Grid.Column>
                <SemanticRadioTypeField
                  values={values}
                  setFieldTouched={setFieldTouched}
                  setValues={setValues}
                  label="Hospital entry"
                  value="Hospital"
                  icon="hospital symbol"
                />
              </Grid.Column>
              <Grid.Column>
                <SemanticRadioTypeField
                  values={values}
                  setFieldTouched={setFieldTouched}
                  setValues={setValues}
                  label="Occupational healthcare entry"
                  value="OccupationalHealthcare"
                  icon="stethoscope"
                />
              </Grid.Column>
              <Grid.Column>
                <SemanticRadioTypeField
                  values={values}
                  setFieldTouched={setFieldTouched}
                  setValues={setValues}
                  label="Health check entry"
                  value="HealthCheck"
                  icon="doctor"
                />
              </Grid.Column>
            </Grid>
            <Divider section />
            <Field
              label="Description"
              placeholder="Description"
              name="description"
              component={TextField}
            />
            <Field
              label="Entry date"
              placeholder="YYYY-MM-DD"
              name="date"
              component={TextField}
            />
            <Field
              label="Specialist"
              placeholder="Specialist"
              name="specialist"
              component={TextField}
            />
            <DiagnosisSelection
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
              diagnoses={Object.values(diagnoses)}
            />

            <SpecificEntryFormFields
              values={values}
              setValues={setValues}
            />

            <Grid>
              <Grid.Column floated="left" width={5}>
                <Button type="button" onClick={onCancel} color="red">
                  Cancel
                </Button>
              </Grid.Column>
              <Grid.Column floated="right" width={5}>
                <Button
                  type="submit"
                  floated="right"
                  color="green"
                  disabled={!dirty || !isValid}
                >
                  Add
                </Button>
              </Grid.Column>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddEntryForm;