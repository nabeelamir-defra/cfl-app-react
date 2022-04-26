import React, { useState } from 'react';
import { Main, InputField, Button, FormGroup, Heading, LoadingBox, ErrorSummary } from 'govuk-react'

import { useInput } from './hooks/useInput'
import { ResultsTable } from './components/results-table'
import { db } from './services/db'

function App() {
  const surname = useInput("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(true)
  const [error, setError] = useState({})

  const downloadData = async (event) => {
    event.preventDefault()
    setError({})
    setLoading(true)
    try {
      const result = await fetch(`${process.env.REACT_APP_SALES_API_URL}/permissions?last_name=Simpson`)
      const json = await result.json()
      await db.permissions.bulkAdd(json)
    } catch (err) {
      console.error(err)
      setError({
        heading: 'Unable to fetch data',
        ...(err.message && { description: err.message })
      })
    }
    setLoading(false)
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setError({})
    setResults([])
    setLoading(true)
    try {
      if (offline) {
        const results = await db.permissions
          .where('entity.referenceNumber')
          .equals('00050522-1WS3FNT-ACVLG3')
          .toArray();
        setResults(results)
      } else {
        const result = await fetch(`${process.env.REACT_APP_SALES_API_URL}/permissions?last_name=${surname.value}`)
        const json = await result.json()
        setResults(json)
      }
    } catch (err) {
      console.error(err)
      setError({
        heading: 'Error finding permission',
        ...(err.message && { description: err.message })
      })
    }

    setLoading(false)
  }
  return (
    <LoadingBox loading={loading}>
      <Main>
        {error.heading && <ErrorSummary heading={error.heading} description={error.description} />}
        <Heading size="LARGE">Check a Fishing Licence</Heading>
        <Button onClick={downloadData}>Download</Button>
        <form onSubmit={submitForm}>
          <FormGroup>
            <InputField {...surname}>Surname</InputField>
          </FormGroup>
          <Button>Find</Button>
          {results.length > 0 && <ResultsTable results={results} />}
        </form>

      </Main>
    </LoadingBox>
  );
}

export default App;
