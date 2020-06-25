import React, {
  Component
} from 'react';

import FlowMap, {
  getViewStateForLocations
} from '@flowmap.gl/react'

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN; // eslint-disable-line

export default class FlowMapRenderer extends Component {
  constructor(props) {
    super(props)
    this.initiateSelectorFunctions();
  }
  
  initiateSelectorFunctions() {
    this._getLocationId = loc => loc.properties.ID;
    this._getFlowMagnitude = flow => flow.trip_count;
    this._getFlowOriginId = f => f.origin_zone;
    this._getFlowDestId = f => f.destination_zone;
    this._onSelected = loc => this.props.handleNodeSelection(loc);
  }

  componentWillReceiveProps(nextProp) {
    if (nextProp.flows.id !== this.props.flows.id) {
      if (nextProp.flows.id === 'ID') {
        // Little hack to trigger a new render for the FlowMap
        this.props.handleViewState({
          ...this.props.viewState,
          latitude: this.props.viewState.latitude + 0.1
        });

      } else {
        // Little hack to trigger a new render for the FlowMap
        this.props.handleViewState({
          ...this.props.viewState,
          latitude: this.props.viewState.latitude + 0.1
        });
      }
    }
  }
  
  render() {
    if (this.props.flows.data == null || !this.props.locations == null) return null;
    
    return (   
        <FlowMap
          getLocationId={this._getLocationId}
          getFlowMagnitude={this._getFlowMagnitude}
          getFlowOriginId={this._getFlowOriginId}
          getFlowDestId={this._getFlowDestId}
          getLocationCentroid={(d) => d.properties.centroid}
          flows={this.props.flows.data}
          locations={this.props.locations}
          initialViewState={this.props.viewState || getViewStateForLocations(this.props.locations.features, (d) => d.properties.centroid, [window.innerWidth, window.innerHeight])}
          mapboxAccessToken={MAPBOX_TOKEN}
          showTotals={true}
          varyFlowColorByMagnitude={true}
          selectedLocationIds={this.props.selected}
          multiselect={true}
          // showOnlyTopFlows={500}
          onViewStateChange={(vs) => this.props.handleViewState(vs)}
          showLocationAreas={false}
          onSelected={(loc) => this.props.handleNodeSelection(loc)}
        />
      );
    }
}
  
