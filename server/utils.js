import fetch from 'node-fetch';

const debug = dbg('karel:server:utils');

export const getProfile = id_token => {
  debug('Getting profile for token: %s', id_token);
  return fetch(
    'https://' + process.env.AUTH0_DOMAIN + '/tokeninfo',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token }),
    }
  ).then(res => res.json());
}

