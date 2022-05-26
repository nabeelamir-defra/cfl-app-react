# Check a Fishing Licence App - Proof of Concept

## Introduction
This React web app is an attempt to create an application that is able to check an Angler's licence by their permission number or last name. It can either be used online, which means it will make queries directly to CRM. Or offline, which will download all the permissions from CRM and store the in an indexed db locally. See the demos folder of it working on mobile.

## Run
### Desktop
Install dependencies, I used node 14.15.0
```
npm i
```
Create a .env file with the following
```
REACT_APP_SALES_API_URL=http://localhost:4000
PORT=3001
```

Build and serve application
```
npm run build
npx serve -s build -p 3001
```

In the rod-licensing checkout cfl-app-react-poc. If it is no longer there, all I did was create a new endpoint with the following code:
```

import { Permission, dynamicsClient, retrieveGlobalOptionSets } from '@defra-fish/dynamics-lib'
import { PredefinedQuery } from '@defra-fish/dynamics-lib/src/queries/predefined-query.js'

export const getPermissions = (lastName, permissionReferenceNumber) => {
  const { licensee, permit, concessionProofs } = Permission.definition.relationships
  let filter = ''
  if (lastName) {
    filter = `${licensee.property}/${licensee.entity.definition.mappings.lastName.field} eq '${lastName}'`
  }
  if(permissionReferenceNumber) {
    filter = `endswith(${Permission.definition.mappings.referenceNumber.field}, '${permissionReferenceNumber}')`
  }

  if(lastName || permissionReferenceNumber) {
    filter += ` and ${Permission.definition.defaultFilter}`
  } else {
    filter = `${Permission.definition.defaultFilter}`
  }
  return new PredefinedQuery({
    root: Permission,
    filter: filter,
    expand: [licensee, permit, concessionProofs]
  })
}

export const executeQuery = async (query, oDataNextLink) => {
  try {
    let response = {}
    console.log(oDataNextLink)
    if(oDataNextLink) {
      response = await dynamicsClient.retrieveMultipleRequest(query.toRetrieveRequest(), oDataNextLink)
    } else {
      response = await dynamicsClient.retrieveMultipleRequest(query.toRetrieveRequest())
    }
    const optionSetData = await retrieveGlobalOptionSets().cached()
    return {
      value: query.fromResponse(response.value, optionSetData),
      oDataNextLink: response.oDataNextLink
    }
  } catch (e) {
    console.error('Failed to execute query: ', e)
    throw e
  }
}

export default [
  {
    method: 'GET',
    path: '/permissions',
    options: {
      handler: async (request, h) => {
        const lastName = request.query.last_name
        const permissionReferenceNumber = request.query.reference_number
        let oDataNextLink = request.query.oDataNextLink
        if(oDataNextLink && oDataNextLink != 'undefined') {
          //oDataNextLink = decodeURIComponent(request.query.oDataNextLink)
        }
     
        let result = {}
        result = executeQuery(getPermissions(lastName, permissionReferenceNumber), oDataNextLink)
        
        return result
      },
      description: 'Get contact data',
      notes: `
          Get contact data
        `,
      tags: ['api', 'pocl-validation-errors'],
      plugins: {
        'hapi-swagger': {
          responses: {
            200: { description: 'OK' }
          }
        }
      }
    }
  }
]
```

### Mobile
Running on mobile is possible, but a bit of a pain. When the app is deployed to a proper server with SSL, then you won't have to do any of this. For offline mode to work the app has to be served over https. The only way to get it to work locally is if the app is running on localhost. So you can't serve the app on your computer, then access it from your mobile on the same network using the computer's ip address. The online functionality will work, but the offline won't. Instead I had to use ADB Reverse Socket, I connected my android phone to the Mac and ran
```
adb reverse tcp:3001 tcp:3001
```
I had to make some changed to the environment variables, instead of REACT_APP_SALES_API_URL=http://localhost:4000, i had to use my Mac's IP address e.g REACT_APP_SALES_API_URL=http://127.0.0.12:4000

## Improvements
There's a few things that I would change: 
- The main one is communicating directly with the sales-api. In live the url is not accessible from the outside, but locally and in dev we can access it directly without any authentication. I would highly recommend communicating directly with CRM. This can be done with the Microsoft Authentication Library. https://docs.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-react. This also ensures that only a signed in user can access it. I did not do it this way as it would involve creating a new certificate in azure, which I do not have access to.
- Displaying the results better. I've displayed the results as json which is not easy to read. Some UR would definitely need to be done for the whole app.
- Give the user sme information on how long it would take to download data. This can be done, by doing a count of all the permissions to be downloaded. Then as each one is added to the db, the UI could be updated to reflect how many is left to add.
- Test offline functionality with more data. I've only tested it with 67,000 and there are over a million active permissions in live?
- It takes a while to download the data, it's currently fetching the permissions, then expanding the contact and permit. Not all the data from the permission and contact is needed, so that can be limited. A list of all the permits only needs to be fetched once, then the permit won't have to be expanded, the id of it can be used
