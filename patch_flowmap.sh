sed -i 's/if (props.selectedLocationIds \&\&/if (typeof(props.selectedLocationIds) !== "undefined" \&\&/g' node_modules/@flowmap.gl/react/dist-esm/FlowMap.js
