import Fade from './Animations';

import React, {useEffect, useState} from 'react';
import { VegaLite } from 'react-vega';

function VegaChart(props) {

  const [values, setValues] = useState([]);
  const { specs } = props
  const { spec, handleData } = specs;
  const { data } = props;
  const { inference_keys } = props.selectedDataChart;

  useEffect(() => {
    if (!data)
      return;
    setValues(handleData(data, inference_keys));
  }, [data, inference_keys, handleData])


  return (
    <VegaLite
      data={values}
      spec={spec}
    />
  )
}

// Component dedicated to manage the specific info
// after you click on a city.
function SpecificInfo(props) {
  const [originNode, setOriginNode] = useState(null);
  const [destNode, setDestNode] = useState(null)
  const [displayText, setDisplayText] = useState('')

  const { location, data, specs } = props; 
  const { title: loadTitle } = specs || { title: (_) => 0 };

  useEffect(() => {
    if (location && location.length !== 2) {
      setOriginNode(null);
      setDestNode(null);
      return;
    }

    const [o, d] = location;
    setOriginNode(o);
    setDestNode(d);

  }, [location])

  useEffect(() => {
    if (originNode && destNode) {
      const originName = originNode.properties.Comuna;
      const destName = destNode.properties.Comuna;
      setDisplayText(loadTitle(originName, destName));
    }

  }, [originNode, destNode, loadTitle])


  return (
  <div style={{position: "absolute", bottom: "5%", right: "2%", background: "none"}}>
  <Fade in={originNode && destNode} style={{paddingLeft: "50px", paddingRight: "50px"}}>
    <p style={{paddingLeft: 50}}>{displayText}</p>
    <VegaChart data={data} specs={props.specs} selectedDataChart={props.selectedDataChart}/>
  </Fade>
  </div>

  )
}

export {SpecificInfo};
