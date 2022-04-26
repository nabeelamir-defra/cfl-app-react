import React from 'react';
import { Table } from 'govuk-react'

export const ResultsTable = ({ results }) => {
  return <Table caption="Results">
    {results.map(result => (
      <Table.Row key={result.entity.id}>
        <Table.Cell>{JSON.stringify(result)}</Table.Cell>
      </Table.Row>
    ))}
  </Table>
}