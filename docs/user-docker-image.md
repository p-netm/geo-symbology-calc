# Geo Symbology Calc

[github repo](https://github.com/onaio/geo-symbology-calc)

## How to use image.

### Prerequisites

**Seting up docker**

see [the official guides for setup instructions by operation system](https://docs.docker.com/get-docker/)

### Run

```
# create an empty local json file.
echo "{}" >> local.json

# Run image in container
docker run --mount type=bind,source="$(pwd)/local.json",destination=/usr/src/symbology/apps/web/config/local.json -p 3000:3000 onaio/geo-symbology-calc:latest
```

**Explanation**:

`echo "{}" >> local.json`

Create a local.json in the current working directory. Writes the string `{}` to the file.

`--mount type=bind,source="$(pwd)/local.json",destination=/usr/src/symbology/apps/web/config/local.json`

Mounts the local.json we created above to this path `/usr/src/symbology/apps/web/config/local.json` in the container.

`-p 3000:3000`

Binds the 3000 port on the host system to the containers 3000 port.
You can now access the running application at `http://localhost:3000`

### Configuration

Image uses a local json file for configuration. This json should be named `local.json` and be both readable and writable.

The files content can be structured as follows:

```json
{
  // log file paths.
  "errorLogFilePath": "../../logs/error.log",
  "combinedLogFilePath": "../../logs/combined.log",
  // symbology configurations as defined here: https://github.com/onaio/geo-symbology-calc/tree/main/packages/core#symbol-config
  "allSymbologyConfigs": [
    {
      "uuid": "735b3181-ab1e-4e39-905e-5516b7024421",
      "baseUrl": "https://stage-api.ona.io",
      "formPair": {
        "regFormId": "3623",
        "visitFormId": "3624"
      },
      "apiToken": "secret key",
      "symbolConfig": [
        {
          "priorityLevel": "Very_High",
          "frequency": 3,
          "symbologyOnOverflow": [
            {
              "overFlowDays": 0,
              "color": "green"
            },
            {
              "overFlowDays": 1,
              "color": "yellow"
            },
            {
              "overFlowDays": 4,
              "color": "red"
            }
          ]
        }
      ]
    }
  ]
}
```
