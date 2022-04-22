import React from 'react';
import { Table } from 'govuk-react'

export const ResultsTable = ({ results }) => {
  return <Table caption="Results">
    {results.map(result => (
      <Table.Row>
        <Table.Cell key={result.id}>{JSON.stringify(result)}</Table.Cell>
      </Table.Row>
    ))}
  </Table>
}