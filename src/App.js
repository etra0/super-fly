import React, {
  useState,
  useEffect
} from 'react';
import FlowMapRenderer from './FlowMapRenderer';
import {
  centroid
} from './helpers'
import {
  SpecificInfo
} from './SpecificInfo';
import {
  AvailableSpecs
} from './DataHandler'
import {
  Specs
} from './Specs'
import GlyphLayer, {GlyphLayerLegend} from './GlyphLayer';

import {
    getViewStateForLocations
} from '@flowmap.gl/react'

// used by the chart selector
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

import DataFilters from './FilterMenu';

const LOCATIONS ='./santiago.json'; //eslint-disable-line

const useStyles = makeStyles((theme) => ({
  root: {
    width: 250,
  },
  button: {
      backgroundColor: 'rgba(255, 255, 255, 0.6)'
  },
  backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
  },
}));

function ChartSelector(props) {
  const classes = useStyles();
  return (
    <div style={{position: "absolute", bottom:"2%", left:"2%"}}>
    <BottomNavigation
      value={props.currentChart}
      onChange={(event, newValue) => {
        props.handleChange(newValue)
      }}
      className={classes.root}
      showLabels
    >
      <BottomNavigationAction label="ModalCell" value='modalcell' className={classes.button} />
      <BottomNavigationAction label="Flowmap" value='flowmap' className={classes.button} />
    </BottomNavigation>
    </div>
  )
}

function FlowSelector(props) {
  const classes = useStyles();

  return (
    <div style={{position: "absolute", bottom:"7%", left:"2%"}}>
    <BottomNavigation
      value={props.flowDirection}
      onChange={(event, newValue) => {
        props.handleChange(newValue)
      }}
      className={classes.root}
      showLabels
    >
      <BottomNavigationAction label="Flujo de entrada" value='inFlow' className={classes.button} />
      <BottomNavigationAction label="Flujo de salida" value='outFlow' className={classes.button} />
    </BottomNavigation>
    </div>
  )
}

function Root() {
  const classes = useStyles();
  // Loads the description of all the available data, this will be responsable of 
  // lazy loading and fetching the data
  const [chartDescriptions, setChartDescriptions] = useState(null);
  
  const [selectedDataChart, setSelectedDataChart] = useState(null);

  // Selected nodes to show in the SpecificInfo
  const [selectedNodes, setSelectedNodes] = useState(null)
  
  // Flowmap data
  const [flows, setFlows] = useState(null);
  const [locations, setLocations] = useState(null);
  
  // Filters and filtered data to show in FlowMap
  const [filters, setFilters] = useState({week: 'week', period: null})
  const [toShow, setDataDisplay] = useState({data: null, id: 'Comuna'});
  const [currentLocations, setCurrentLocations] = useState(null);
  
  const [graphSpecs, setGraphSpecs] = useState(null);

  const [currentChart, setCurrentChart] = useState('flowmap');

  // contains the flow direction for the modal cell chart
  const [flowDirection, setFlowDirection] = useState('inFlow');

  const [currentInference, setCurrentInference] = useState('all');

  const [viewState, setViewState] = useState(null);
  const [communes, setCommunes] = useState(null);
  const [communesMap, setCommunesMap] = useState(null);

  const handleNodeSelection = (d) => {
    if (d.length === 0) {
      setSelectedNodes(null)
    } else if (d.length > 2) {
      setSelectedNodes([...d.slice(1)])
    } else {
      setSelectedNodes([...d])
    }

  }

  // filter the data to show
  const { zoom } = viewState || { zoom: 0 };
  // console.log(zoom);
  const changedZoom = zoom < 11.5;
  useEffect(() => {

    if (!flows) return;
    const filterFunction = filters.week === 'week' ? (d => d <=4 ) : (d => d > 4);
    let selectedData = flows.filter(d => filterFunction(d.dayofweek) &&
      d.period === filters.period);

    // mapping the data in the case where there's enough zoom out.
    let id = 'Comuna'
    setSelectedNodes(null);
    if (changedZoom) {
      id = 'Comuna';
      selectedData = selectedData.map(v => {
        let { origin_zone, destination_zone } = v;
        origin_zone = communesMap[origin_zone];
        destination_zone = communesMap[destination_zone];
        return { ...v, origin_zone, destination_zone};
      });
      setCurrentLocations(communes);
    } else {
      id = 'ID'
      setCurrentLocations(locations);
    }


    if (currentInference !== 'all' && currentChart === 'flowmap') {
      selectedData = selectedData.map(v => {
        let { trip_count } = v;
        trip_count *= v[currentInference];
        let new_v = { ...v, trip_count };
        return new_v;
      });
    }
    setDataDisplay({data: selectedData, id});


  }, [flows, filters, currentInference, communesMap, communes, changedZoom,
    currentChart, locations]);

  useEffect(_ => {
    // this file contains the description of the chart
    // that includes the inference keys and their names
    fetch('/chart_description.json')
      .then(response => response.json())
      .then(availableCharts => {
        setChartDescriptions(availableCharts);
        setFilters({...filters, period: availableCharts[0].periods[0]});
        setSelectedDataChart(availableCharts[0]);
      });

    fetch(LOCATIONS)
    .then(response => response.json())
    .then(data => {
      const communes = {};
      const communesMap = {};
      data.features.forEach((d, i) => {
        d.properties.centroid = centroid(d);

        // prep. the data for the outer zoom generation
        const { Comuna, ID } = d.properties;
        if (!(Comuna in communes)) {
          communes[Comuna] = [];
        }
        communes[Comuna].push({id: ID, centroid: d.properties.centroid, Comuna});
        communesMap[ID] = Comuna;
      })

      // calc the bigger centroid
      const _communes = [];
      Object.keys(communes).forEach(key => {
        const current = communes[key];
        const len = current.length;
        const new_centroid = current.reduce((acc, value) => {
          acc[0] += value.centroid[0];
          acc[1] += value.centroid[1];
          return acc;
        }, [0, 0])
          .map(v => v/len);
        _communes.push({ properties: { centroid: new_centroid, ID: key, Comuna: key }});
      });

      setCommunes(_communes);
      setCommunesMap(communesMap);
      setLocations(data.features);

      setViewState(getViewStateForLocations(data.features, (d) =>
        d.properties.centroid, [window.innerWidth, window.innerHeight]))
    })
    .catch(e => console.log(e));

  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!selectedDataChart) return;
    setFlows(undefined);

    fetch(selectedDataChart.dataset_name)
    .then(response => response.json())
    .then(data => {
      setFlows(data);
    })
    .catch(e => console.log(e))
  }, [selectedDataChart]);

  
  const _flowmap = (
    <FlowMapRenderer
      locations={currentLocations} 
      flows={toShow} 
      communes={communes}
      handleNodeSelection={handleNodeSelection} 
      viewState={viewState}
      handleViewState={d => setViewState(d)}
      selected={selectedNodes}/>
  );

  const _glyph = (
    <GlyphLayer
      locations={currentLocations}
      flows={toShow.data}
      currentLevel={toShow.id}
      handleViewState={d => setViewState(d)}
      flowDirection={flowDirection}
      viewState={viewState}
      selectedDataChart={selectedDataChart}
    />
  );

  return ( 
    <div>
      <Backdrop className={classes.backdrop} open={!locations || !flows}>
        <CircularProgress color="secondary" />
      </Backdrop>

      { currentChart === 'modalcell' ? _glyph : _flowmap }

      <SpecificInfo 
        location={selectedNodes ? 
          selectedNodes.map(d => ({id: d, properties: currentLocations.filter(x => x.properties.ID === d)[0].properties})) : []}
        data={selectedNodes && selectedNodes.length === 2 ? 
          toShow.data.filter(x => x.origin_zone === selectedNodes[0] && x.destination_zone === selectedNodes[1] && x.period === filters.period)[0] : null}
        specs={Specs.filter(v => graphSpecs === v.value)[0]}
        selectedDataChart={selectedDataChart}
      />

      <AvailableSpecs handler={setGraphSpecs}/>

      { filters.period && <DataFilters 
        week={w => setFilters(prevState => ({...prevState, week: w}))}
        period={p => setFilters(prevState => ({...prevState, period: p}))}
        inference={p => setCurrentInference(p)}
        filters={filters}
        inferenceFilterName={ selectedDataChart && selectedDataChart.inference_filter_name ? selectedDataChart.inference_filter_name : "Filtro" }
        chartDescriptions={chartDescriptions}
        selectedDataChart={selectedDataChart}
        currentChart={currentChart}
        handleSelectedDataChart={v => setSelectedDataChart(v)}
      /> }

      <ChartSelector
        currentChart={currentChart}
        handleChange={setCurrentChart}
      />

      {currentChart === 'modalcell' && <FlowSelector
        flowDirection={flowDirection}
        handleChange={setFlowDirection}
      />}

      {currentChart === 'modalcell' && <GlyphLayerLegend
        selectedDataChart={selectedDataChart}
      />}


    </div>
    );
}


export default Root;
