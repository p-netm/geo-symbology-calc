# @onaio/geo-symbol-calc

This package contains the core business logic of the app. It does so by:

- Defining the symbol config schema i.e how the configs that define the business rules on the color coding are shaped as.
- Is able to parse the config, pull data from the api, evaluate the symbol color and modify the submissions.

> This package is not intended to be used as a standalone but as an api to a Graphical/Text based interface that would make it easier for the users to generate configs and run pipelines.

## API

### transform **function(config: Omit<Config, 'schedule'>)**

/\*\* The main function that is able to consume a symbol config, and from it,

- pull the submissions from the api, after which its able to decide marker-color change
- and pushes the same to the api.
-
- @param config - symbol config
  \*/

### transformOnSchedule **function(config: Config)**

/\*_ Wrapper around the transform function, calls transform on a schedule _/

## Symbol config

The transformer function expects the config object to conform to the following interface.

```typescript

SymbologyConfig = {
 priorityLevel: PriorityLevel;
 // Max number of days since the last visit to geopoint with the aforementioned priority level
 frequency: number;
 /* Color code configs depending on days passed since the frequency days lapsed.
 * The color is matched using <= operator i.e. if days passed are less than or equal to frequency + overFlowDays.
 * e.g {
     priorityLevel: PriorityLevel.VERY_HIGH,
     frequency: 3,
     symbologyOnOverflow: [
       {
         overFlowDays: 0,
         color: 'green'
       },
       {
         overFlowDays: 1,
         color: 'yellow'
       },
       {
         overFlowDays: 4,
         color: 'red'
       }
     ]
   }
   given the above config the color will be picked as follows:
   on day (today - last visit)
   on day 0 - green since 0 <= (3 + 0) (frequency + overflow days)
   on day 3 - green since 3 <= (3 + 0)
   on day 4 - yellow since 4 > (3 + 0) but 4 <= (3 + 1)
   on day 5 - red since 5 > (3 + 0) and 5 > 4 (3 + 1) but 5 < (3 + 4)
   */
 symbologyOnOverflow: { overFlowDays: number; color: Color }[];
}[];

/** Describes the configs for a single pipeline */
export interface Config {
 // form pair ids
 formPair: {
   // id for form used to register the geo points
   regFormId: string;
   // id for form used by Health workers to visit added geopoints
   visitFormId: string;
 };
 // Business rules config - How to decide which color codes to add per facility id
 symbolConfig: SymbologyConfig;
 // logger function
 logger?: LogFn;
 // More permanent token, you can get this from `{{ _.baseUrl }}/api/v1/user`.api_token
 apiToken: string;
 // base url where the api instance is deployed
 baseUrl: string;
 // cron-like syntax that represents when the pipeline represented by this config runs.
 // this can be more easily generated using an online tool like
 schedule: CronTabString;
}

```

For instance, lets look at how the config for running the rules shown in the table below would look like.

![image](https://user-images.githubusercontent.com/28119869/197401889-45a8c769-26b1-4a83-8874-884378ea3c6b.png)

with a schedule where this pipeline should be run once on monday every week would be specified by the config:

```
{
  formPair: {
    regFormId: '0',
    visitFormId: '1
  },
  symbolConfig: [
    {
      priorityLevel: PriorityLevel.VERY_HIGH,
      frequency: 3,
      symbologyOnOverflow: [
        {
          overFlowDays: 0,
          color: 'green'
        },
        {
          overFlowDays: 1,
          color: 'yellow'
        },
        {
          overFlowDays: 4,
          color: 'red'
        }
      ]
    },
    {
      priorityLevel: PriorityLevel.HIGH,
      frequency: 7,
      symbologyOnOverflow: [
        {
          overFlowDays: 0,
          color: 'green'
        },
        {
          overFlowDays: 1,
          color: 'red'
        }
      ]
    },
    {
      priorityLevel: PriorityLevel.MEDIUM,
      frequency: 14,
      symbologyOnOverflow: [
        {
          overFlowDays: 0,
          color: 'green'
        },
        {
          overFlowDays: 1,
          color: 'red'
        }
      ]
    },
    {
      priorityLevel: PriorityLevel.LOW,
      frequency: 30,
      symbologyOnOverflow: [
        {
          overFlowDays: 0,
          color: 'green'
        },
        {
          overFlowDays: 1,
          color: 'red'
        }
      ]
    }
  ],
  apiToken: "secret",
  baseUrl: 'https://stage-api.ona.io',
  schedule: '0 0 * * 1'
}
```

The accompanying web application should hopefully make the process of creating this conig easier.
