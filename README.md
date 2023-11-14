# CLI for the Citizen Knowledge Graph project

More info [here](https://citizen-knowledge-graph.github.io/ckg-site/).

User profiles in RDF Turtle format are getting validated by SHACL shapes that represent the eligibility criteria for different funding opportunities.

## Setup

```sh
npm install
npm run build
```

## Run

```sh
npm start print-all-queries
npm start run-all-queries-on-profile citizen-a
npm start run-query-on-profile citizen-solar-funding citizen-a
```

## Functionality

#### List the rules from all queries

```
Rules from SHACL file: ngo-sustainability-funding
┌───────────┬───────┬─────┬─────┬────────────────┬────────────┐
│ field     │ class │ min │ max │ exact          │ type       │
├───────────┼───────┼─────┼─────┼────────────────┼────────────┤
│ type      │       │     │     │                │ NGOProfile │
├───────────┼───────┼─────┼─────┼────────────────┼────────────┤
│ employees │       │ 10  │     │                │            │
├───────────┼───────┼─────┼─────┼────────────────┼────────────┤
│ focusArea │       │     │     │ Sustainability │            │
├───────────┼───────┼─────┼─────┼────────────────┼────────────┤
│ location  │       │     │     │ Berlin         │            │
└───────────┴───────┴─────┴─────┴────────────────┴────────────┘
```

#### Run all queries against a profile

```
Results of running all queries on citizen-b:
┌─────────────────────────────────┬──────────┬──────────────┬──────────────┐
│ Query                           │ Eligible │ Non-eligible │ Missing-data │
├─────────────────────────────────┼──────────┼──────────────┼──────────────┤
│ citizen-child-allowance         │ x        │              │              │
├─────────────────────────────────┼──────────┼──────────────┼──────────────┤
│ citizen-ecar-bonus              │          │ x            │              │
├─────────────────────────────────┼──────────┼──────────────┼──────────────┤
│ citizen-insulation-bonus        │          │              │ x            │
├─────────────────────────────────┼──────────┼──────────────┼──────────────┤
│ citizen-solar-funding           │          │              │ x            │
├─────────────────────────────────┼──────────┼──────────────┼──────────────┤
│ citizen-wohngeld                │          │              │ x            │
├─────────────────────────────────┼──────────┼──────────────┼──────────────┤
│ municipality-sportfield-funding │          │ x            │              │
├─────────────────────────────────┼──────────┼──────────────┼──────────────┤
│ ngo-sustainability-funding      │          │ x            │              │
└─────────────────────────────────┴──────────┴──────────────┴──────────────┘

Missing data analysis:

If you add this 1 data point, I can check your eligibility for 2 more queries:
roofArea(integer) -->  citizen-insulation-bonus, citizen-solar-funding

If you add these 2 data points, I can check your eligibility for 1 more query:
monthlyIncome(integer), rents(Flat)  -->  citizen-wohngeld

```

#### Run a specific query against a profile

```
citizen-b is NOT eligible for citizen-solar-funding:
┌──────────┬──────────┬───────────┬──────────┬─────────────────┐
│ Instance │ Field    │ Violation │ Is-Value │ Threshold-Value │
├──────────┼──────────┼───────────┼──────────┼─────────────────┤
│ HouseB   │ roofArea │ existence │          │ 100             │
├──────────┼──────────┼───────────┼──────────┼─────────────────┤
│ HouseB   │ houseAge │ max       │ 25       │ 20              │
└──────────┴──────────┴───────────┴──────────┴─────────────────┘
```
