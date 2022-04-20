import React from 'react';
import { Main, InputField, Button, FormGroup, Heading } from 'govuk-react'

function App() {
  return (
    <Main>
      <Heading size="LARGE">Check a Fishing Licence</Heading>
      <FormGroup>
        <InputField
          input={{
            name: 'group0'
          }}
        >
          Surname
        </InputField>
      </FormGroup>
      <Button>Find</Button>
    </Main>
  );
}

export default App;
