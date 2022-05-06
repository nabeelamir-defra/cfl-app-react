import React, { useState, useEffect } from 'react';
import { Main, InputField, Button, FormGroup, Heading, LoadingBox, ErrorSummary, GridRow, GridCol, Paragraph, Tag } from 'govuk-react'

import { useInput } from './hooks/useInput'
import { ResultsTable } from './components/results-table'
import { db } from './services/db'

function App() {
  const surnameInput = useInput("")
  const referenceNumberInput = useInput("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  const [error, setError] = useState({})
  const [offlineDatabaseCount, setOfflineDatabaseCount] = useState('0')

  const refreshOfflineDateCount = async () => {
    const count = await db.permissions.count()
    setOfflineDatabaseCount('' + count)
  }

  useEffect(() => {
    console.log(navigator.onLine)
    if (!navigator.onLine) setOffline(true);
  }, []);

  useEffect(() => {
    refreshOfflineDateCount()
  }, [])

  const fetchDataRecursive = async (oDataNextLink) => {
    let url = `${process.env.REACT_APP_SALES_API_URL}/permissions`
    if(oDataNextLink) {
      url += `?oDataNextLink=${encodeURIComponent(oDataNextLink)}`
    }

    const result = await fetch(url)
    const json = await result.json()
    try {
      await db.permissions.bulkAdd(json.value)
    } catch (err) {
      console.error(err)
    }
    if(json.oDataNextLink) {
      await fetchDataRecursive(json.oDataNextLink)
    }
    return
  }

  const downloadData = async (event) => {
    event.preventDefault()
    setError({})
    setLoading(true)
    try {
      await fetchDataRecursive()
    } catch (err) {
      console.error(err)
      setError({
        heading: 'Unable to fetch data',
        ...(err.message && { description: err.message })
      })
    }
    refreshOfflineDateCount()
    setLoading(false)
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setError({})
    setResults([])
    if (!surnameInput.value && !referenceNumberInput.value) {
      setError({
        heading: 'Please enter a surname or permission number'
      })
      return
    }
    if (surnameInput.value && referenceNumberInput.value) {
      setError({
        heading: 'Please enter only one of surname or permission number'
      })
      return
    }
    if (offline && referenceNumberInput.value && referenceNumberInput.value.length < 12) {
      setError({
        heading: 'Only full permission number searches are permitted in offline mode'
      })
      return
    }
    if (!offline && referenceNumberInput.value && referenceNumberInput.value.length < 6) {
      setError({
        heading: 'Please enter more than 6 characters when searching in online mode'
      })
      return
    }
    setLoading(true)
    try {
      if (offline) {
        let query = ""
        if (referenceNumberInput.value) {
          query = db.permissions.where('entity.referenceNumber').equals(referenceNumberInput.value)
        }
        if (surnameInput.value) {
          query = db.permissions.where('expanded.licensee.entity.lastName').equals(surnameInput.value)
        }
        const results = await query.toArray();
        setResults(results)
      } else {
        const result = await fetch(`${process.env.REACT_APP_SALES_API_URL}/permissions?last_name=${surnameInput.value}&reference_number=${referenceNumberInput.value}`)
        const json = await result.json()
        setResults(json.value)
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
        <GridRow>
          <GridCol>
            <Heading size="LARGE">Check a Fishing Licence</Heading>
          </GridCol>
          <GridCol setWidth="one-quarter">
            {!offline ? <Tag>Online</Tag> : <Tag inactive>Offline</Tag>}
          </GridCol>
        </GridRow>
        <GridRow>
          <GridCol setWidth="one-half">
            <Button onClick={downloadData}>Download</Button>
          </GridCol>
          <GridCol setWidth="one-half">
            <Paragraph>{offlineDatabaseCount + ' records in offline database'}</Paragraph>
          </GridCol>
        </GridRow>
        <form onSubmit={submitForm}>
          <FormGroup>
            <InputField {...surnameInput}>Surname</InputField>
          </FormGroup>
          <FormGroup>
            <InputField {...referenceNumberInput} hint="You can search by the last 6 characters in online mode. In offline mode you must enter the full permission reference number">Reference Number</InputField>
          </FormGroup>
          <Button>Find</Button>
          {results.length > 0 && <ResultsTable results={results} />}
        </form>

      </Main>
    </LoadingBox>
  );
}

export default App;
