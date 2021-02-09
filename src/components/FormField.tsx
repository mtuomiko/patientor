import React from "react";
import { ErrorMessage, Field, FieldProps, FormikProps } from "formik";
import { Checkbox, CheckboxProps, Dropdown, DropdownProps, Form, Icon, Radio, RadioProps, SemanticICONS } from "semantic-ui-react";
import { Diagnosis, Gender } from "../types";
import { EntryFormValues, FormOccupationalHealthcareEntry } from "../AddEntryModal/AddEntryForm";

// structure of a single option
export type GenderOption = {
  value: Gender;
  label: string;
};

// props for select field component
type SelectFieldProps = {
  name: string;
  label: string;
  options: GenderOption[];
};

export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  options
}: SelectFieldProps) => (
  <Form.Field>
    <label>{label}</label>
    <Field as="select" name={name} className="ui dropdown">
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label || option.value}
        </option>
      ))}
    </Field>
  </Form.Field>
);

interface TextProps extends FieldProps {
  label: string;
  placeholder: string;
}

export const TextField: React.FC<TextProps> = ({
  field,
  label,
  placeholder,
}) => (
  <Form.Field>
    <label>{label}</label>
    <Field placeholder={placeholder} {...field} />
    <div style={{ color: 'red' }}>
      <ErrorMessage name={field.name} />
    </div>
  </Form.Field>
);

/*
  for exercises 9.24.-
*/
interface NumberProps extends FieldProps {
  label: string;
  errorMessage?: string;
  min: number;
  max: number;
}

export const NumberField: React.FC<NumberProps> = ({ field, label, min, max }) => (
  <Form.Field>
    <label>{label}</label>
    <Field {...field} type='number' min={min} max={max} />

    <div style={{ color: 'red' }}>
      <ErrorMessage name={field.name} />
    </div>
  </Form.Field>
);

export const DiagnosisSelection = ({
  diagnoses,
  setFieldValue,
  setFieldTouched,
}: {
  diagnoses: Diagnosis[];
  setFieldValue: FormikProps<{ diagnosisCodes: string[] }>["setFieldValue"];
  setFieldTouched: FormikProps<{ diagnosisCodes: string[] }>["setFieldTouched"];
}) => {
  const field = "diagnosisCodes";
  const onChange = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: DropdownProps
  ) => {
    setFieldTouched(field, true);
    setFieldValue(field, data.value);
  };

  const stateOptions = diagnoses.map(diagnosis => ({
    key: diagnosis.code,
    text: `${diagnosis.name} (${diagnosis.code})`,
    value: diagnosis.code
  }));

  return (
    <Form.Field>
      <label>Diagnoses</label>
      <Dropdown
        fluid
        multiple
        search
        selection
        options={stateOptions}
        onChange={onChange}
      />
      <ErrorMessage name={field} />
    </Form.Field>
  );
};
/*
  own code
*/
export const SemanticRadioTypeField = ({
  values,
  setFieldTouched,
  setValues,
  label,
  value,
  icon,
}: {
  values: EntryFormValues;
  setFieldTouched: FormikProps<{ type: string }>["setFieldTouched"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValues: any; // Had major problems typing this ?_?
  label: string;
  value: string;
  icon: SemanticICONS;
}) => {
  const changeType = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: RadioProps,
  ) => {
    setFieldTouched("type", true);
    // setFieldValue("type", data.value, true);

    const { description, date, specialist, diagnosisCodes, ..._tail } = values;
    const baseValues = {
      description,
      date,
      specialist,
      diagnosisCodes,
      type: data.value,
    };
    switch (data.value) {
      case "Hospital":
        const hospitalValues = {
          ...baseValues,
          discharge: {
            date: "",
            criteria: "",
          },
        };
        setValues(hospitalValues);
        break;
      case "OccupationalHealthcare":
        const occupationalValues = {
          ...baseValues,
          employerName: "",
          includeSickLeave: false,
          sickLeave: {
            startDate: "",
            endDate: "",
          },
        };
        setValues(occupationalValues);
        break;
      case "HealthCheck":
        const healthValues = {
          ...baseValues,
          healthCheckRating: 0,
        };
        setValues(healthValues);
        break;
    }
  };
  return (
    <Form.Field>
      <Radio
        label={label}
        name="type"
        value={value}
        checked={values.type === value}
        onChange={changeType}
      />
      <Icon name={icon} size="big" />
    </Form.Field>
  );
};

export const SemanticSickLeaveCheckboxField = ({
  values,
  setValues,
}: {
  values: FormOccupationalHealthcareEntry;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValues: any;
}) => {
  const changeIncludeSickLeave = (
    _event: React.SyntheticEvent<HTMLElement, Event>,
    data: CheckboxProps,
  ) => {
    const { ...newValues } = values;
    newValues.includeSickLeave = data.checked ?? false;
    setValues(newValues);
  };
  return (
    <Form.Field>
      <Checkbox
        label="Include sick leave"
        name="includeSickLeave"
        checked={values.includeSickLeave}
        onChange={changeIncludeSickLeave}
      />
    </Form.Field>
  );
};

// Possibly useful generic wrapper for using Semantic UI with Formik?
// https://github.com/formium/formik/issues/148#issuecomment-626138062
