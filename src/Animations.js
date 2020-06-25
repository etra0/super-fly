import { Transition } from 'react-transition-group';
import React from 'react';
// import { tsPropertySignature } from '@babel/types';

const duration = 300;


const defaultStyle = {
    transition: `opacity ${duration}ms ease-in-out`,
    opacity: 0,
    background: "white",
    visibility: "hidden",
    width: "550px",
  }
  
  const transitionStyles = {
    entering: { opacity: 1, visibility: "visible", width: "550px" },
    entered:  { opacity: 1, visibility: "visible", width: "550px" },
    exiting:  { opacity: 0, visibility: "visible", width: "550px" },
    exited:  { opacity: 0, visibility: "hidden", width: "0px"},
  };

  // eslint-disable-next-line
const Fade = ({ in: inProp, children: children }) => (
    <Transition in={inProp} timeout={duration} mountOnEnter={true}>
      {state => (
        <div style={{
          ...defaultStyle,
          ...transitionStyles[state]
        }}>
          {children}
        </div>
      )}
    </Transition>
  );

export default Fade;
