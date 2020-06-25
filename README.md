<p align="center">
  <img height="300" src="https://vignette.wikia.nocookie.net/jojo/images/1/14/Super_Fly.png/revision/latest?cb=20160627082522&path-prefix=es">
</p>

# Super-Fly

Super-Fly [(スーパーフライ, supā furai)](https://jojo.fandom.com/es/wiki/Super_Fly) es una web-app que permite generar una visualización interactiva usando Flowmap
y una visualización nueva llamada ModalCell

# Configuración

## 1. Generar Mapbox Token

El primer paso consiste en generar un token de mapbox donde se
puede leer una explicación [acá](https://docs.mapbox.com/help/how-mapbox-works/access-tokens/).

Una vez generado, modificar el archivo `.env` de la raíz del proyecto,
debería quedar algo así:
```
REACT_APP_MAPBOX_TOKEN=pk.abcDEFGHIJKL-q_jLKAJ
```
Notar que **no** va entre comillas.

## 2. Generar los datos

Para esta visualización, se requiere que los datos cumplan los siguientes criterios:

El GeoJSON debe contener por cada `feature`:

* `ID`: identificador único que se ocupará para asignar los flujos

* `Comuna`: Nombre macro que se ocupa para agrupar (generar el cluster) 
la visualización cuando el zoom está alejado

Nótese que los nombres son **case sensitive**.

Para cambiar el GeoJSON a utilizar, en el código `src/App.js` línea 33
se debe colocar el nombre del GeoJSON (y este debe estar guardado en
`public/`). Siga el ejemplo con el ya existente (`public/santiago.json`)

---

Los datos a utilizar deben estar en el formato
```json
[
  {"origin_zone": 321, "destination_zone": 123, "dayofweek": 0,
  "period": "morning", "key1": 0.6, "key2": 0.4, "trip_count": 321},

  {"origin_zone": 256, "destination_zone": 143, "dayofweek": 6,
  "period": "afternoon", "key1": 0.3, "key2": 0.7, "trip_count": 192}
]
```
Donde las ids de `origin_zone` y `destination_zone` tienen que estar contenidas
en el GeoJSON en las `ID`s, `dayofweek` es un numero del 0 al 6 (considerando 0 día Lunes)

Las llaves de inferencia pueden tener el nombre que desees, porque se configuran
en un json separado.

En la carpeta `data-join` hay un jupyter de ejemplo que genera datos.

**Estos datos tienen que estar en la carpeta `public/`**

### 2.1. Configuración de la visualización

El proyecto debe contener un archivo llamado `public/chart_description.json`,
donde esperamos las llaves sean autoexplicativas:
```
[
    {
    # Nombre del dataset
    "name": "Antenas", 

    # Nombre del json a ser cargado (debe estar en public)
    "dataset_name": "od_matrix_model_merged_90.json", 

    # llaves contenidas dentro del dataset
    "inference_keys": ["shared_taxi", "motorized", "non_motorized", "public"], 

    # Alias de las llaves
    "inference_keys_names": ["Colectivo", "Vehículo motorizado", "Vehículo no motorizado", "Transporte público"], 

    # Alias del tipo de inferencia
    "inference_filter_name": "Medios de viaje", 

    # la cantidad de colores debe ser la misma que la cantidad de llaves
    "inference_colors": [ 
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3"
    ],

    # Periodos disponibles para filtrar
    "periods": [
      "afternoon_peak",
      "afternoon_valley",
      "morning_valley",
      "night",
      "morning_peak_1",
      "morning_peak_2",
      "night_valley"
    ]
	}
]
```

Actualmente puede haber más de una configuración pero solo con un GeoJSON
(i.e. no se puede cambiar de ciudad).

## 3. Compilación

Una vez hecho todos esos ajustes, ejecutar lo siguiente:
```bash
# Instalar dependencias de JavaScript (toma un rato)
npm install

# Parchar bug en FlowMap
bash patch_flowmap.sh

# Compilación del proyecto
npm run build
```

Y con eso se debería generar una carpeta llamada `build`,
donde una vez estando dentro de la carpeta,
se debería poder levantar el proyecto con un simple `python -m http.server`
