const Specs = [
    {
      value: 'vehicleType',
      label: 'Tipo de vehículo',
      title: (origin, destination) =>
        `Distribución de viaje entre ${origin} y ${destination}`,
  
      spec: {
        "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
        description: "Test",
        data: { name: "test" },
        mark: "bar",
        encoding: {
          y: { field: "kind", type: "ordinal" },
          x: { field: "value", type: "quantitative" }
        },
        width: "container",
        autosize: {
          resize: true
        }
      },
  
      handleData: (dataset, keys) => {
        const val = {
          test: keys.map(key => ({ kind: key, value: dataset[key] }))
        };
        return val;
      }
    },

//     {
//         value: 'vehicleTypeVertical',
//         label: 'Tipo de vehículo vertical',
//       title: (origin, destination) =>
//         `Distribución de viaje entre ${origin} y ${destination} Vertical`,
//   
//       spec: {
//         "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
//         description: "Test hee hee",
//         data: { name: "test" },
//         mark: "bar",
//         encoding: {
//           x: { field: "kind", type: "ordinal" },
//           y: { field: "value", type: "quantitative" }
//         },
//         width: "container",
//         autosize: {
//           resize: true
//         }
//       },
//   
//       handleData: (dataset, keys) => {
//         const val = {
//           test: keys.map(key => ({ kind: key, value: dataset[key] }))
//         };
//         return val;
//       }
//       }
  ];

export {Specs}
