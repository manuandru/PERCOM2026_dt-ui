# Basic Usage

1. Create your instance of Ditto Eclipse using [this guide](https://github.com/eclipse-ditto/ditto/tree/master/deployment/docker).

2. Convert your user and password to base64 using this format `<user>:<password>` and store it in the `.env` file using the VITE_AUTH_TOKEN variable.

   > echo -n 'ditto:ditto' | base64

3. If you are using a custom Ditto base URL, store it in the `.env` file using the VITE_DITTO_BASE variable.

4. run `npm i` for installing dependencies.

5. run `npm run dev` for starting the app.

# Overview

The data displayed by this project is organized into two main concepts:

- Attributes are descriptive fields that provide information about an item;

- Features are measurable or functional properties related to the item;

Both attributes and features can contain nested fields. For example:

```json
{
  ...
  "attributes": {
    "location": "Bologna",
    "model": "Coffee Brewer",
  },

  "features": {
    "coffee-brewer": {
      ...
    },
    "water-tank": {
      ...
    }
  ...
  }
  ...
}

```

- If you want to see one of your smart things in the Map, you can write in the location field the coordinates of the thing in the following format: `latitude,longitude`.

- The model field is used to show the name of the thing.

## Testing with sample data

To run tests with synthetic data:

```bash
uv run python load_random_to_ditto.py --yes
```
