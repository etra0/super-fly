import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect } from 'react';
import { Specs } from './Specs';



const useStyles = makeStyles({
  root: {
    width: 250,
  },
  button: {
      backgroundColor: 'rgba(255, 255, 255, 0.6)'
  }
});

function AvailableSpecsHandler(props) {
  const classes = useStyles();
  const [value, setValue] = useState(Specs[0].value);

  return (
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          props.handleChange(newValue)
        }}
        showLabels
        className={classes.root}
      >
        {Specs.map((v, i) => (<BottomNavigationAction key={i} label={v.label} value={v.value} className={classes.button}/>))}
      </BottomNavigation>
    );
}

export function AvailableSpecs(props) {
  const { handler } = props;
  useEffect(() => {
    handler(Specs[0].value)
  }, [handler])
  
  return (
    <div style={{position: "absolute", left: "2%", top: '2%', display:"flex", flexDirection: "column", alignItems: "center"}}>
    <AvailableSpecsHandler handleChange={(v) => props.handler(v)}/>
    </div>
  );
}

