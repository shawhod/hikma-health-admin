import * as echarts from 'echarts';
import Select from 'react-select';
import AppLayout from '../../components/Layout';
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Grid,
  InputLabel,
  Paper,
  Popover,
  Stack,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import {
  IconCalendarBolt,
  IconChevronDown,
  IconList,
  IconMedicineSyrup,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import ReactECharts from 'echarts-for-react';
import { usePatientRegistrationForm } from '../../hooks/usePatientRegistrationForm';
import { RegistrationForm } from './patients/registration-form';
import { listToFieldOptions } from '../../utils/form-builder';
import { FieldOption, HHForm } from '../../types/Inputs';
import { getAllForms } from './forms-list';
import { v4 as uuidv4 } from 'uuid';
import { useDebouncedValue } from '@mantine/hooks';
import axios from 'axios';
import { Patient } from '../../types/Patient';
import { Prescription } from '../../types/Prescription';
import { Appointment } from './appointments/list';
import { Event } from '../../types/Event';
import If from '../../components/If';
import { useEventForms } from '../../hooks/useEventForms';

const HIKMA_API = process.env.NEXT_PUBLIC_HIKMA_API;

type ExplorerOperator =
  | 'contains'
  | 'does not contain'
  | 'is empty'
  | 'is not empty'
  | '='
  | '<'
  | '>'
  | '<='
  | '>='
  | '!=';

const operators: { value: ExplorerOperator; label: string }[] = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '=', label: '=' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '!=', label: '≠' },
  { value: 'contains', label: 'contains' },
  { value: 'does not contain', label: 'does not contain' },
  { value: 'is empty', label: 'is empty' },
  { value: 'is not empty', label: 'is not empty' },
];

type PatientFiltersProps = {
  form: RegistrationForm;
  filterFieldRules: FilterRule[];
  onRemove: () => void;
  onUpdateRule: (rule: FilterRule) => void;
  onAddRule: () => void;
  onRemoveRule: (id: string) => void;
};
function PatientFilters({
  form,
  filterFieldRules,
  onRemove,
  onUpdateRule,
  onAddRule,
  onRemoveRule,
}: PatientFiltersProps) {
  const fieldNames = form.fields
    .filter((f) => f.deleted !== true && f.label?.en)
    .map((f) => ({ label: f?.label?.en || 'error', value: f.id }))
    .filter((f) => f.label !== 'error' && f.value);

  const handleUpdateRule = (
    field: FilterRule,
    key: keyof FilterRule,
    value: FilterRule[keyof FilterRule]
  ) => {
    const newRule = {
      ...field,
      [key]: value,
    };
    onUpdateRule(newRule);
  };

  const handleUpdateRuleField = (field: FilterRule, columnId: string) => {
    const columnName = form.fields.find((f) => f.id === columnId)?.column;
    if (!columnName) {
      return;
    }
    const newRule = {
      ...field,
      // VERY IMPORTANT TO CHANGE THE ID TO MATCH THE COLUMN
      fieldId: columnId,
      field: columnName,
    };
    onUpdateRule(newRule);
  };

  return (
    <Paper shadow="sm" p={10}>
      <Flex justify="space-between">
        <Title order={3}>Patients</Title>
        <ActionIcon onClick={onRemove} color="red">
          <IconTrash size={15} color="orange" />
        </ActionIcon>
      </Flex>

      <div>
        {filterFieldRules.map((f) => {
          return (
            <Grid key={f.id}>
              <Grid.Col span={4}>
                <InputLabel>Field</InputLabel>
                <Select<FieldOption, false>
                  defaultValue={f.fieldId as any}
                  options={fieldNames as any}
                  onChange={(opt) => {
                    handleUpdateRuleField(f, opt?.value || '');
                  }}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <InputLabel>Operator</InputLabel>
                <Select<ExplorerOperator, false>
                  defaultValue={f.operator}
                  // @ts-ignore
                  options={operators as FieldOption[]}
                  // @ts-ignore
                  onChange={(opt) => onUpdateRule({ ...f, operator: opt?.value || ('' as any) })}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                {/* TODO: Add support for a dropdown if the form field is a dropdown */}
                <TextInput
                  defaultValue={f.value}
                  label="Value"
                  onChange={(e) => onUpdateRule({ ...f, value: e.target.value })}
                />
              </Grid.Col>
              <Grid.Col sx={{ display: 'flex', alignItems: 'flex-end' }} span={1}>
                <ActionIcon onClick={() => onRemoveRule(f.id)} color="red">
                  <IconMinus size={15} color="orange" />
                </ActionIcon>
              </Grid.Col>
            </Grid>
          );
        })}
      </div>

      <Button fullWidth mt={10} variant="transparent" onClick={onAddRule}>
        Add rule
      </Button>
    </Paper>
  );
}

// FIXME: Should the custom fields and their grid be a separate component?

function EventFilters() {
  return (
    <Paper shadow="sm">
      <Title order={3}>Events</Title>

      <div>
        <Grid>
          <Grid.Col span={4}>
            <InputLabel>Field</InputLabel>
            <Select options={[]} />
          </Grid.Col>
          <Grid.Col span={4}>
            <InputLabel>Operator</InputLabel>
            <Select options={operators} />
          </Grid.Col>
          <Grid.Col span={4}>
            {/* TODO: Add support for a dropdown if the form field is a dropdown */}
            <TextInput label="Value" />
          </Grid.Col>
        </Grid>
      </div>
    </Paper>
  );
}

type ExplorerModule = 'patient' | 'event' | 'appointment' | 'prescription';

const explorerModules: {
  icon: any;
  name: string;
  value: ExplorerModule;
  isActive: boolean;
}[] = [
  { icon: IconUser, name: 'Patient', value: 'patient', isActive: true },
  { icon: IconList, name: 'Event (Coming soon)', value: 'event', isActive: false },
  {
    icon: IconCalendarBolt,
    name: 'Appointment (Coming soon)',
    value: 'appointment',
    isActive: false,
  },
  {
    icon: IconMedicineSyrup,
    name: 'Prescription (Coming soon)',
    value: 'prescription',
    isActive: false,
  },
];

// FilterField is a '.' separated string where the first part is the table name and the second part is the column name
type FilterField = string;

type FilterRule = {
  id: string; // the id of the rule (nothing to do with the actual data itself)
  fieldId: string; // The id of the field / column
  field: FilterField;
  operator: ExplorerOperator;
  value: string;
};

type ExplorerFilters = {
  rules: Record<ExplorerModule, FilterRule[]>;
};

type PatientFilter = {
  // Core patient fields
  baseFields: FilterRule[];

  // Additional attributes
  attributeFields: FilterRule[];
};

type EventFilter = FilterRule[];

type AppointmentFilter = FilterRule[];

type PrescriptionFilter = FilterRule[];

type ExploreQuery = {
  patient: PatientFilter;
  event: EventFilter;
  appointment: AppointmentFilter;
  prescription: PrescriptionFilter;
};

type SlicerData = {
  patients: Patient[];
  events: Event[];
  prescriptions: Prescription[];
  appointments: Appointment[];
};

export default function DataExplorer() {
  const { form: registrationForm, isLoading: isLoadingRegistrationForm } =
    usePatientRegistrationForm();
  const { forms: eventForms, isLoading: isLoadingForms, refetch: refetchForms } = useEventForms();
  const [filters, setFilters] = useState<ExplorerFilters>({
    rules: {
      patient: [],
      event: [],
      appointment: [],
      prescription: [],
    },
  });
  const [activeFilterModules, setActiveFilterModules] = useState<ExplorerModule[]>([]);
  const [debouncedFilters] = useDebouncedValue(filters, 1500);

  const [slicerDataId, setSlicerDataId] = useState<string>(uuidv4());
  const [slicerData, setSlicerData] = useState<SlicerData>({
    patients: [],
    events: [],
    prescriptions: [],
    appointments: [],
  });

  const addFilterModule = (moduleName: ExplorerModule) => () => {
    if (activeFilterModules.includes(moduleName)) {
      return;
    }
    setActiveFilterModules([...activeFilterModules, moduleName]);
    addRule(moduleName)();
  };

  const addRule = (moduleName: ExplorerModule) => () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      rules: {
        ...prevFilters.rules,
        [moduleName]: [
          ...prevFilters.rules[moduleName],
          { id: uuidv4(), fieldId: '', field: '', operator: '=', value: '' },
        ],
      },
    }));
  };

  const removeRule = (moduleName: ExplorerModule) => (id: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      rules: {
        ...prevFilters.rules,
        [moduleName]: prevFilters.rules[moduleName].filter((r) => r.id !== id),
      },
    }));
  };

  const removeFilterModule = (moduleName: ExplorerModule) => () => {
    setActiveFilterModules(activeFilterModules.filter((mod) => mod !== moduleName));
  };

  const setRule = (moduleName: ExplorerModule) => (rule: FilterRule) => {
    setFilters((prevFilters) => {
      const moduleRules = prevFilters.rules[moduleName];
      const existingRuleIndex = moduleRules.findIndex((r) => r.id === rule.id);

      let updatedModuleRules;
      if (existingRuleIndex !== -1) {
        updatedModuleRules = [...moduleRules];
        updatedModuleRules[existingRuleIndex] = rule;
      } else {
        updatedModuleRules = [...moduleRules, rule];
      }

      return {
        ...prevFilters,
        rules: {
          ...prevFilters.rules,
          [moduleName]: updatedModuleRules,
        },
      };
    });
  };

  const rerun = async () => {
    // Format patient filters into a query string
    const patientFilters: PatientFilter = filters.rules.patient.reduce(
      (acc, rule) => {
        const formField = registrationForm?.fields.find((f) => f.id === rule.fieldId);
        console.log({ formField, rule, registrationForm });
        // if the field doesn't exist, don't add it
        if (!formField) return acc;

        // if the field is an empty string, dont add it
        if (rule.field === '') return acc;

        // if the operator is an empty string, dont add it
        // @ts-expect-error we are setting the string to empty even though it has a type
        if (rule.operator === '') return acc;

        // if the value is an empty string, dont add it
        if (rule.value === '') return acc;

        if (formField.baseField) {
          acc.baseFields.push(rule);
        } else {
          acc.attributeFields.push(rule);
        }

        return acc;
      },
      { baseFields: [], attributeFields: [] } as PatientFilter
    );

    const queryFilters: ExploreQuery = {
      patient: patientFilters,
      event: [],
      appointment: [],
      prescription: [],
    };

    console.log(JSON.stringify(patientFilters, null, 2));

    // TODO: if the base fields and attribute fields are empty, don't send the query
    if (
      queryFilters.patient.baseFields.length === 0 &&
      queryFilters.patient.attributeFields.length === 0
    ) {
      return;
    }

    const res = await axios.post(
      `${HIKMA_API}/v1/admin/data-explorer`,
      {
        ...queryFilters,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: String(localStorage.getItem('token')),
        },
      }
    );

    const { patients, events, prescriptions, appointments } = res.data.data || {
      patients: [],
      events: [],
      prescriptions: [],
      appointments: [],
    };

    setSlicerData({
      patients: patients || [],
      events: events || [],
      prescriptions: prescriptions || [],
      appointments: appointments || [],
    });

    setSlicerDataId(uuidv4());
  };

  useEffect(() => {
    rerun();
  }, [debouncedFilters]);

  console.log({ filters });

  return (
    <AppLayout title="Data Explorer">
      <Grid>
        <Grid.Col span={5} py={18}>
          <Stack gap={32}>
            {activeFilterModules.map((mod) => {
              switch (mod) {
                case 'patient':
                  return registrationForm ? (
                    <PatientFilters
                      key={mod}
                      onUpdateRule={setRule(mod)}
                      onAddRule={addRule(mod)}
                      onRemoveRule={removeRule(mod)}
                      filterFieldRules={filters.rules.patient}
                      form={registrationForm}
                      onRemove={removeFilterModule(mod)}
                    />
                  ) : (
                    <div key={mod}>
                      Error: There are no saved registration forms, please save a form first to
                      proceed.
                    </div>
                  );
                case 'event':
                  return <EventFilters key={mod} />;
                default:
                  return <div key={mod}></div>;
              }
            })}

            <Popover width={300} trapFocus position="bottom" withArrow shadow="md">
              <Popover.Target>
                <Button className="primary" leftSection={<IconPlus size={16} />} fullWidth>
                  Add Module
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                {explorerModules
                  .filter((mod) => !activeFilterModules.includes(mod.value))
                  .map((mod) => (
                    <Button
                      key={mod.name}
                      variant="transparent"
                      disabled={!mod.isActive}
                      leftSection={<mod.icon size={16} />}
                      onClick={addFilterModule(mod.value)}
                    >
                      {mod.name}
                    </Button>
                  ))}
              </Popover.Dropdown>
            </Popover>
          </Stack>
        </Grid.Col>
        <Grid.Col span={7}>
          <Flex justify="space-between">
            <Button onClick={rerun} leftSection={<IconRefresh size={16} />}>
              Rerun
            </Button>
          </Flex>
          <DataSlicer data={slicerData} dataId={slicerDataId} />
        </Grid.Col>
      </Grid>
    </AppLayout>
  );
}

function getYAxisMax(maxValue: number): number {
  // Add 10% buffer above the max value
  const withBuffer = Math.ceil(maxValue * 1.25);
  if (withBuffer < 10) {
    return 10;
  } else if (withBuffer < 100) {
    // round up to the nearest 10
    return Math.ceil(withBuffer / 10) * 10;
  } else {
    // round up to the nearest 100
    return Math.ceil(withBuffer / 100) * 100;
  }
}

const DataSlicer = ({ data, dataId }: { data: SlicerData; dataId: string }) => {
  const options = useMemo(() => {
    return {
      grid: { top: 8, right: 8, bottom: 24, left: 36 },
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          smooth: true,
        },
      ],
      tooltip: {
        trigger: 'axis',
      },
    };
  }, [dataId]);

  const patientChartOptions = useMemo(() => {
    return {
      grid: { top: 8, right: 8, bottom: 24, left: 36 },
      xAxis: {
        type: 'category',
        data: ['Patients'],
      },
      yAxis: {
        type: 'value',
        max: getYAxisMax(data.patients.length),
      },
      series: [
        {
          data: [data.patients.length],
          type: 'bar',
        },
      ],
      tooltip: {
        trigger: 'axis',
      },
      toolbox: {
        show: true,
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {},
        },
      },
      legend: {
        data: ['Patients'],
        bottom: 0,
      },
    };
  }, [dataId]);

  const isEmptyData = useMemo(() => {
    return (
      data.patients.length === 0 &&
      data.events.length === 0 &&
      data.prescriptions.length === 0 &&
      data.appointments.length === 0
    );
  }, [dataId]);

  return (
    <div>
      <Box>SLICER & DICER (MEASUREMENTS) GO HERE</Box>

      <If show={!isEmptyData}>
        <Box>
          <ReactECharts option={patientChartOptions} />
        </Box>
      </If>
    </div>
  );
};
