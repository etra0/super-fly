import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';


const useStyles = makeStyles({
  root: {
    width: 250,
    marginBottom: 10,
  },
  button: {
      backgroundColor: 'rgba(255, 255, 255, 0.6)'
  }
});

// filter related to the week or weekend
function WeekSelector(props) {
    const classes = useStyles();
    const [value, setValue] = useState('week');

    return (
      <React.Fragment>
        <InputLabel>Período de la semana</InputLabel>
          <Select
            value={value}
            onChange={(event) => {
              const newValue = event.target.value;
              setValue(newValue);
              props.handleChange(newValue)
            }}
            className={classes.root}
          >
            <MenuItem value='week'>Semana</MenuItem>
            <MenuItem value='weekend'>Fin de Semana</MenuItem>
          </Select>
        </React.Fragment>
      );
}

function PeriodSelector(props) {
  const classes = useStyles();
  const { periods } = props || { periods: ['morning_valley'] };
  const [value, setValue] = useState(props.currentFilters.period);

  return (
    <React.Fragment>
        <InputLabel>Período</InputLabel>
        <Select
          value={value}
          onChange={(event) => {
            const newValue = event.target.value;
            setValue(newValue);
            props.handleChange(newValue)
          }}
          className={classes.root}
        >
          { periods.map((v, i) => (<MenuItem key={i} value={v}>{v}</MenuItem>)) }
      </Select>
    </React.Fragment>
    );
}

// filter related to the dataset loaded defined in
// chart_description.json
function DatasetSelector(props) {
  const classes = useStyles();
  const { chartDescriptions } = props;
  const [value, setValue] = useState(0);
  if (!chartDescriptions) return null;

  const setSelectedDataChart = (index) => {
    const selected = chartDescriptions[index];
    props.handleChange(selected);
  }

  return (
    <React.Fragment>
      <InputLabel>Dataset</InputLabel>
      <Select
        value={value}
        onChange={(event) => {
          const newValue = event.target.value;
          setValue(newValue);
          setSelectedDataChart(newValue);
        }}
        className={classes.root}
      >
        { chartDescriptions.map((v, i) =>
          (<MenuItem key={i} value={i}>{v.name}</MenuItem>)) }
      </Select>
    </React.Fragment>
    );
}

function InferenceSelector(props) {
  const classes = useStyles();
  const [value, setValue] = useState('all');
  const { inferenceKeys, inferenceKeysNames, currentChart } = props;

  return (
    <React.Fragment>
      <InputLabel>{props.inferenceFilterName}</InputLabel>
        <Select
          value={currentChart === 'flowmap' ? value : 'all'}
          onChange={(event) => {
            const newValue = event.target.value;
            setValue(newValue);
            props.handleChange(newValue)
          }}
          disabled={currentChart !== 'flowmap'}
          className={classes.root}
        >
          <MenuItem value='all'>Todos</MenuItem>
          { inferenceKeys.map((v, i) => 
            (<MenuItem key={i} value={v}>{inferenceKeysNames[i]}</MenuItem>)) }
        </Select>
      </React.Fragment>
    );
}

function DataFilter(props) {
  const { selectedDataChart } = props;
  const { inference_keys, inference_keys_names, periods } = selectedDataChart ||
    { inference_keys: [], inference_keys_names: [], periods: [] }


  return (
    <div style={{position: "absolute", right: "2%", top:'2%', padding: '10px', display:"flex", flexDirection: "column",  backgroundColor: 'white'}}>
      <WeekSelector handleChange={props.week}/>
      <PeriodSelector handleChange={props.period} periods={periods} currentFilters={props.filters}/>
      <InferenceSelector handleChange={props.inference}
      inferenceKeys={inference_keys}
      inferenceKeysNames={inference_keys_names}
      currentChart={props.currentChart}
      inferenceFilterName={props.inferenceFilterName}
      />
      <DatasetSelector
        chartDescriptions={props.chartDescriptions}
        selectedDataChart={props.selectedDataChart}
        handleChange={props.handleSelectedDataChart} />
      
    </div>
  );
}


export default DataFilter;
