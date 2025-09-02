## Introduction

The compiler "remembers" the fields used in previous queries and uses them to compute the joins, causing unnecessary joins in some queries.

* This happens on the latest Cube.js version (1.3.62 at the time of writing)
* This happens since Cube.js version [0.35.80](https://github.com/cube-js/cube/releases/tag/v0.35.80), likely from "fix(schema-compiler): propagate FILTER_PARAMS from view to inner cube's SELECT" ([#8466](https://github.com/cube-js/cube/pull/8466) / [c0466fd](https://github.com/cube-js/cube/commit/c0466fde9b7a3834159d7ec592362edcab6d9795))
* The fix in Cube.js version [0.36.3](https://github.com/cube-js/cube/releases/tag/v0.36.3), "fix(schema-compiler): fix FILTER_PARAMS propagation from view to cube's SQL query" ([#8721](https://github.com/cube-js/cube/pull/8721) / [ec2c2ec](https://github.com/cube-js/cube/commit/ec2c2ec4d057dd1b29748d2b3847d7b60f96d5c8)) does not solve this issue


## Reproduction steps

### Build

The docker compose file was taken as-is from <https://cube.dev/docs/product/deployment/core>, with a ClickHouse database setup added.

```sh
docker compose build
```

### Run the queries

> [!WARNING]
> Make sure to run the queries quickly after starting `cube_api`, as the queries triggered in the background by the scheduler can influence the results.

1. Start `cube_api`:
   ```sh
   docker compose up cube_api
   ```
2. Run a first query that uses two cubes:
   ```json
   {
       "dimensions": ["Tickets.ticketId", "Messages.ticketId"],
       "segments": ["Tickets.closedTickets"],
       "measures": ["Tickets.ticketCount"]
   }
   ```
   ```sh
   curl 'http://localhost:4000/cubejs-api/v1/sql' -X POST -H 'Content-Type: application/json' --data-raw '{"query":{"dimensions":["Tickets.ticketId","Messages.ticketId"],"segments":["Tickets.closedTickets"],"measures":["Tickets.ticketCount"]}}' | jq -r '.sql.sql[0]'
   ```
3. Notice the (expected) `LEFT JOIN` between both cubes (see [query_1.json](outputs/query_1.json) / [query_1.sql](outputs/query_1.sql))
4. Run a second query that uses a single cube:
   ```json
   {
       "dimensions": ["Tickets.ticketId"],
       "segments": ["Tickets.closedTickets"],
       "measures": ["Tickets.ticketCount"]
   }
   ```
   ```sh
   curl 'http://localhost:4000/cubejs-api/v1/sql' -X POST -H 'Content-Type: application/json' --data-raw '{"query":{"dimensions":["Tickets.ticketId"],"segments":["Tickets.closedTickets"],"measures":["Tickets.ticketCount"]}}' | jq -r '.sql.sql[0]'
   ```
5. The `LEFT JOIN` is here even though it's not necssary (see [query_2.json](outputs/query_2.json) / [query_2.sql](outputs/query_2.sql))

> [!NOTE]
> * If you swap the order of the queries on a fresh start, it works as expected, see [query_3.json](outputs/query_3.json) / [query_3.sql](outputs/query_3.sql) and [query_4.json](outputs/query_4.json) / [query_4.sql](outputs/query_4.sql)
> * If you use filters instead of a segment, it works as expected
> * If the segment does not use `FILTER_PARAMS`, it works as expected
