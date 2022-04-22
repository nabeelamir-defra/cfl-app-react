import React, { useState } from 'react';
import { Main, InputField, Button, FormGroup, Heading } from 'govuk-react'

import { useInput } from './hooks/useInput'
import { ResultsTable } from './components/results-table'

function App() {
  const surname = useInput("")
  const [results, setResults] = useState([])

  const submitForm = async (event) => {
    event.preventDefault()
    setResults([])
    const result = await fetch(`${process.env.REACT_APP_SALES_API_URL}/permissions?last_name=${surname.value}`)
    const json = await result.json()
    setResults(json)

    console.log("surname", surname.value)
  }
  return (
    <Main>
      <Heading size="LARGE">Check a Fishing Licence</Heading>
      <form onSubmit={submitForm}>
        <FormGroup>
          <InputField {...surname}>Surname</InputField>
        </FormGroup>
        <Button>Find</Button>
        {results.length > 0 && <ResultsTable results={results} />}
      </form>

    </Main>
  );
}

export default App;
