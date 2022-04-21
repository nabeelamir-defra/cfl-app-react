import React from 'react';
import { Main, InputField, Button, FormGroup, Heading } from 'govuk-react'

import { useInput } from './hooks/useInput'

function App() {
  const surname = useInput("")

  const submitForm = (event) => {
    event.preventDefault()
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
      </form>
    </Main>
  );
}

export default App;
