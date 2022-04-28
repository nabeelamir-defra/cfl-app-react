import Dexie from 'dexie';

export const db = new Dexie('cfl_app_local_db');
db.version(1).stores({
  permissions: 'entity.referenceNumber,expanded.licensee.entity.lastName', // Primary key and indexed props
});