import React, {Component} from 'react';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {LineLayer, ScatterplotLayer} from '@deck.gl/layers';
import { scaleLinear } from 'd3-scale';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  maxZoom: 15,
};

const LINEWIDTH = 10;

let SCALE = null;

let CIRCLE_SCALE = null;

function colorToHexArray(v) {
  const color = parseInt(v.replace("#", ""), 16);
  const arr = [
    (color & 0xFF0000) >> 16,
    (color & 0xFF00) >> 8,
    (color & 0xFF)
  ]

  return arr;
}

export function GlyphLayerLegend (props) {
  const { inference_keys, inference_keys_names, inference_colors } = props.selectedDataChart;
  return (
    <div style={{position: 'absolute', right: '2%', bottom: '2%', backgroundColor: 'white', padding: "0px 20px"}}>
      {inference_keys.map((v, i) => (
        <p key={i}><span style={{color: inference_colors[i]}}>■</span> {inference_keys_names[i]}</p>
      ))}
    </div>
  );
}

/* eslint-disable react/no-deprecated */
export default class GlyphLayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locationDict: {},
      flows: [],
      locations: this.props.locations,
      inFlow: null,
      outFlow: null,
      passingFlow: null,

    }
  }

  componentWillMount() {
    this._generateLocationDict(this.props.locations);
  }

  componentDidUpdate(prevProps) {
    if (this.props.locations !== prevProps.locations) {
      console.log("ComponentWillReceiveProps was executed");
      console.log(prevProps.locations, this.props.locations);
      this._generateLocationDict(this.props.locations);
    } else if (this.props.flows !== prevProps.flows || this.props.flowDirection !== prevProps.flowDirection) {
      console.log("componentDidUpdate was executed");
      this._handleData();
    }
  }

  // first function, it bins and reorder the data from the flows.
  _handleData() {
    console.log("handleData was triggered");
    const { flows } = this.props;

    const _inFlow = {};
    const _outFlow = {};
    const totalLocations = {
      inFlow: {},
      outFlow: {},
    };
    const { inference_keys } = this.props.selectedDataChart;
    const zeroedInference = inference_keys.reduce((acc, value) => { acc[value] = 0; return acc }, {});

    let max = 0;
    flows.forEach((v) => {
      const {
        origin_zone,
        destination_zone,
        trip_count,
      } = v;

      if (origin_zone === destination_zone) return;

      if (!(destination_zone in _inFlow)) {
        _inFlow[destination_zone] = [...Array(12)].map(_ => ({...zeroedInference}));
        totalLocations.inFlow[destination_zone] = {...zeroedInference};
      }

      if (!(origin_zone in _outFlow)) {
        _outFlow[origin_zone] = [...Array(12)].map(_ => ({...zeroedInference}));
        totalLocations.outFlow[origin_zone] = {...zeroedInference};
      }

      // inflow means dest <- orig
      let inFlowBin = this._get_binning_location(origin_zone, destination_zone, this.state.locationDict) - 1;
      let outFlowBin = this._get_binning_location(destination_zone, origin_zone, this.state.locationDict) - 1;

      // update inflow and outflow, with anonymous maping!
      [
        [_inFlow, 'inFlow', destination_zone, inFlowBin],
        [_outFlow, 'outFlow', origin_zone, outFlowBin]
      ].forEach(([ targetDict, flowName, zone, bin ]) => {
        inference_keys.forEach(key => {
          targetDict[zone][bin][key] += trip_count * v[key];
          totalLocations[flowName][zone][key] += trip_count * v[key];
        })
      });
      
      // ---- 
      max = Math.max(max, trip_count);

      return;
    })

    const { flowDirection } =  this.props;
    const _locations = totalLocations[flowDirection];
    let max_circle = Math.max(...Object
      .values(_locations)
      .map(k => Math.max(...Object.values(k))));

    console.log("max circle", max_circle);
    let MULT = this.props.currentLevel === 'Comuna' ? 5 : 1;

    let currentFlow = this.props.flowDirection === 'inFlow' ? _inFlow : _outFlow;

    let max_path = Math.max(...Object
      .values(currentFlow)
      .flat()
      .map(x => Object.values(x))
      .flat());

    SCALE = scaleLinear().domain([0, max_path]).range([0, .009*(MULT*3/5)]);
    CIRCLE_SCALE = scaleLinear().domain([0, max_circle]).range([0, 50*MULT]);

    // sorting the circle layers
    // so the biggest one get the first layer
    const locations = [...this.props.locations].map(v => {
      const {ID} = v.properties;
      try {
        ['inFlow', 'outFlow'].forEach(flow => {
          v[flow] = inference_keys.map(key => ({kind: key, value: totalLocations[flow][String(ID)][key]}));
          v[flow].sort((a, b) => b.value - a.value);
        });
      } catch {
        ['inFlow', 'outFlow'].forEach(flow => {
          v[flow] = inference_keys.map(key => ({kind: key, value: 0}));
        });

      }

      return v;
    })
    

    this.setState({
      inFlow: {..._inFlow},
      outFlow: {..._outFlow},
      locations: [...locations]
    }, this._handleFlows);

  }

  _generateLocationDict(locations) {
    const _locationDict = locations.reduce((acc, l) => {
      const {ID, centroid} = l.properties;
      acc[ID] = centroid;
      return acc;
    }, {});

    this.setState({locationDict: {..._locationDict}}, () => this._handleData());
  }

  _handleFlows() {
    let currentFlows = this.state[this.props.flowDirection];
    let flows = [];
    const { inference_keys } = this.props.selectedDataChart;
    console.log("handleFlows triggered");

    Object.keys(currentFlows).forEach(key => {
      let current_location = this.props.locations
        .filter(v => String(v.properties.ID) === key)[0][this.props.flowDirection]
        .map(v => v.value);

      let circle_size = Math.max(...Object.values(current_location));
      console.log(CIRCLE_SCALE(circle_size));
      

      let local_scale = scaleLinear().domain(CIRCLE_SCALE.domain()).range(SCALE.domain());

      let k = this.props.currentLevel === 'Comuna' ? 0.6 : 0.75;
      circle_size = local_scale(circle_size*k);

      currentFlows[key].forEach((v, i) => {
        const origin = this._generate_relative_position(this.state.locationDict[key], i, circle_size);

        const destinations = inference_keys.map(key => ({kind: key, value: this._generate_relative_position(origin, i, v[key]), length: v[key]}));
        destinations.sort((a, b) => b.length - a.length)
        for(let i = destinations.length - 1; i >= 1; i--) {
          destinations[i-1].length += destinations[i].length;
        }

        destinations.forEach((d) => {
          d.value = this._generate_relative_position(origin, i, d.length);
        })


        flows.push({
          origin: origin,
          destinations: [...destinations]
        })
      })

    })

    this.setState({flows: [...flows]});
  }

  _generate_relative_position(origin_coords, bin, length) {
    const [ox, oy] = origin_coords;

    const _nvector = [
      SCALE(Math.cos(2*Math.PI*bin/12)*length),
      SCALE(Math.sin(2*Math.PI*bin/12)*length*0.85)];

    return [ox + _nvector[0], oy + _nvector[1]];
  }

  _binning(value, max, n) {
    const bins = [...Array(n + 1)].map((_, i) => max*(i/n));
    let i;
    for (i = 0; i < bins.length && value > bins[i]; i++);
    return i;
  }

  // origin & destination must be the number of the nodes.
  _get_binning_location(origin, destination, locationDict) {
    const or = locationDict[origin];
    const de = locationDict[destination];

    const [ox, oy] = or;
    const [dx, dy] = de;

    const vector = [dx-ox, dy-oy];
    const angle = Math.atan2(vector[1],vector[0]) + Math.PI
    const bin = this._binning(angle, 2*Math.PI, 12);

    return bin
  }

  _renderLayers() {
    const { locations } = this.state; 
    const { flows } = this.state;
    const { inference_keys, inference_colors } = this.props.selectedDataChart;

    if (flows.length === 0) return;

    // layers that later will be merged
    const lineLayers = [];
    const scatterLayers = [];

    inference_keys.forEach((v, i) => {
      scatterLayers.push(
        new ScatterplotLayer({
          id: `glyph-center-${i}`,
          data: locations,
          radiusScale: 5,
          getPosition: d => d.properties.centroid,
          getFillColor: d => { 
            const chartIndex = inference_keys.indexOf(d[this.props.flowDirection][i].kind);
            return colorToHexArray(inference_colors[chartIndex]);
          },
          getRadius: d => CIRCLE_SCALE(d[this.props.flowDirection][i].value),
          pickable: true
        })
      )

      lineLayers.push(
        new LineLayer({
          id: `glyph-bar-${i}`,
          data: flows,
          getSourcePosition: d => d.origin,
          getTargetPosition: d => d.destinations[i].value,
          getColor: d => {
            const chartIndex = inference_keys.indexOf(d.destinations[i].kind);
            return colorToHexArray(inference_colors[chartIndex]);
          },
          getWidth: d => LINEWIDTH,
          pickable: true,
        })
      );

    });

    return [...scatterLayers, ...lineLayers];

  }

  render() {
    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={this.props.viewState || INITIAL_VIEW_STATE}
        onViewStateChange={d => this.props.handleViewState(d.viewState)}
        controller={true}
      >

        <StaticMap
        reuseMaps
        preventStyleDiffing={true}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
    )
  }
  
}
